import { vec3 } from "gl-matrix";
import { CommandContext, FunctionalCommand, getCommandContext } from "..";
import { FixedLengthArray, NonNullableFields, PerspectiveCamera, PerspectiveCameraRay, PointData3D, SpringObjectValue, SpringScalarValue, SpringValue, takeEmitterEvent, takeEveryEmitterEvent } from "../../../../core/utils";
import type { CardModel, GameModel } from "../../models";
import { PerspectiveCard } from "../../components/card";
import { FederatedPointerEvent } from "pixi.js";
import { Spring } from "../../../../core/utils";
import { call, cancelled, fork, cancel } from "redux-saga/effects";
import { animate } from "motion";

export const scoopRoomCardsCommand: FunctionalCommand = (
    function* scoopRoomCardsCommand(...roomCardsModels: FixedLengthArray<CardModel, typeof GameModel["CARDS_DEALT_PER_ROOM"]>) {
        const { scene, world } = this as NonNullableFields<CommandContext>;
        const roomCards = roomCardsModels
            .map(roomCardModel => world.cards.find(card => card.model === roomCardModel))
            .filter(card => !!card);

        scene.interactive = true;

        yield fork(function* (): Generator<any, void, any> {
            try {
                while (true) {
                    roomCards.forEach(card => card.interactive = true);
                    const [pointerDownEvent] = yield takeEmitterEvent(scene, "pointerdown");
                    roomCards.forEach(card => card.interactive = false);
                    const cardDragContext = yield call(onPointerDownWorker, pointerDownEvent, roomCardsModels);

                    if (cardDragContext) {
                        const onPointerMoveWatcherFork = yield takeEveryEmitterEvent(scene, "pointermove", function* (event) {
                            yield call(onPointerMoveWorker, event, cardDragContext)
                        });
                        const [pointerUpEvent] = yield takeEmitterEvent(scene, "pointerup");

                        yield cancel(onPointerMoveWatcherFork);
                        yield call(onPointerUpWorker, pointerUpEvent, cardDragContext);
                    }
                }
            }
            finally {
                if (yield cancelled()) {

                }
            }
        });
    }
);

function* onPointerDownWorker(event: FederatedPointerEvent, roomCardsModels: CardModel[]): Generator<any, CardDragContext | undefined, any> {
    if (event.target instanceof PerspectiveCard) {
        const draggedCard = event.target;
        const commandContext = yield* getCommandContext();
        const { world } = commandContext as NonNullableFields<CommandContext>;
        const roomCards = roomCardsModels
            .map(roomCardModel => world.cards.find(card => card.model === roomCardModel))
            .filter(card => !!card);
        const followerCards = roomCards.filter(predicateCard => predicateCard !== draggedCard);
        const springs = new Map<PerspectiveCard, SpringType>();
        const worldPoint = world.toLocal(event.global);
        const ray = world.camera.createRay(worldPoint.x, worldPoint.y);
        const cardsPlane = vec3.fromValues(0, 0, 1);
        const intersection = ray.intersectPlane([draggedCard.position3D.x, draggedCard.position3D.y, draggedCard.position3D.z], cardsPlane);

        draggedCard.zIndex = 999;

        for (let i = 0; i < followerCards.length; i++) {
            const spring = createCardSpring(followerCards[i], world.camera);
            spring.transitionTo({ ...draggedCard.position3D }, { delayMS: i * 30 })
            springs.set(followerCards[i], spring);
        }

        for (let roomCard of roomCards) {
            animate(roomCard.rotation3D, { x: 0, y: 180, z: 0 }, { duration: 0.4, onUpdate: () => roomCard.updatePerspective(world.camera) });
        }

        return {
            dragStartIntersectionPoint: vec3.copy(vec3.create(), intersection!.point),
            originalCardsPositions: new Map<PerspectiveCard, PointData3D>(roomCards.map((roomCard, i) => ([roomCard, { ...world.layout.slots.roomCards[i].position3D }]))),
            draggedCard,
            followerCards,
            springs
        };
    }
}

function* onPointerMoveWorker(event: FederatedPointerEvent, cardDragContext: CardDragContext): Generator<any, void, any> {
    const commandContext = yield* getCommandContext();
    const { world } = commandContext as NonNullableFields<CommandContext>;
    const { draggedCard, followerCards, dragStartIntersectionPoint, springs } = cardDragContext;
    const worldPoint = world.toLocal(event.global);
    const ray = world.camera.createRay(worldPoint.x, worldPoint.y);
    const cardsPlane = vec3.fromValues(0, 0, 1);
    const intersection = ray.intersectPlane([draggedCard.position3D.x, draggedCard.position3D.y, draggedCard.position3D.z], cardsPlane);

    if (intersection) {
        const delta = vec3.sub(vec3.create(), intersection.point, dragStartIntersectionPoint);

        draggedCard.position3D.x += delta[0];
        draggedCard.position3D.y += delta[1];
        draggedCard.position3D.z += delta[2];
        draggedCard.updatePerspective(world!.camera);

        vec3.copy(dragStartIntersectionPoint, intersection.point);

        for (let i = 0; i < followerCards.length; i++) {
            const followerCard = followerCards[i];
            const followerCardSpring = springs.get(followerCard);

            followerCardSpring?.transitionTo({ ...draggedCard.position3D });
        }
    }
}

function* onPointerUpWorker(event: FederatedPointerEvent, cardDragContext: CardDragContext): Generator<any, void, any> {
    const commandContext = yield* getCommandContext();
    const { world } = commandContext as NonNullableFields<CommandContext>;
    const { draggedCard, springs, originalCardsPositions } = cardDragContext;
    const roomCards = [...originalCardsPositions.keys()];

    draggedCard.zIndex = 0;

    yield Promise.all([
        ...roomCards.map((card) => new Promise<void>(resolve => {
            const originalCardPosition = originalCardsPositions.get(card);
            const cardSpring = springs.get(card) ?? createCardSpring(draggedCard, world.camera);
            cardSpring.transitionTo({ ...originalCardPosition });
            cardSpring.onRest(() => {
                cardSpring.destroy();
                springs.delete(card);
                resolve();
            });
        })),
        ...roomCards.map((card) => animate(card.rotation3D, { x: 0, y: 0, z: 0 }, { duration: 0.2, onUpdate: () => card.updatePerspective(world.camera) }))
    ]);
}

function createCardSpring(followerCard: PerspectiveCard, camera: PerspectiveCamera): SpringType {
    const spring = Spring({ ...followerCard.position3D }, { precision: 10, damping: 20 });

    spring.onUpdate((value: SpringValue) => {
        followerCard.position3D.x = (value as SpringObjectValue).x;
        followerCard.position3D.y = (value as SpringObjectValue).y;
        followerCard.position3D.z = (value as SpringObjectValue).z;
        followerCard.updatePerspective(camera);
    });

    return spring;
}

type SpringType = ReturnType<typeof Spring>;

type CardDragContext = {
    draggedCard: PerspectiveCard,
    followerCards: PerspectiveCard[],
    dragStartIntersectionPoint: vec3,
    originalCardsPositions: Map<PerspectiveCard, PointData3D>,
    springs: Map<PerspectiveCard, SpringType>
}