import { vec3 } from "gl-matrix";
import { CommandContext, FunctionalCommand, getCommandContext } from "..";
import { FixedLengthArray, NonNullableFields, PointData3D, takeEmitterEvent, takeEveryEmitterEvent } from "../../../../core/utils";
import type { CardModel, GameModel } from "../../models";
import { PerspectiveCard } from "../../components/card";
import { FederatedPointerEvent } from "pixi.js";
import { call, cancelled, fork, cancel, delay } from "redux-saga/effects";
import { animate } from "animejs";
import { animateDepositDraggedCardsStack, animateLiftDungeonDeck, animateRetrieveDraggedCardsStack, animateReturnDraggedCardsToRoomPositions } from "./animation";
import { DraggedCardsStack } from "./DraggedCardsStack";

export const scoopRoomCardsCommand: FunctionalCommand = (
    function* scoopRoomCardsCommand(...roomCardsModels: FixedLengthArray<CardModel, typeof GameModel["CARDS_DEALT_PER_ROOM"]>) {
        const { scene, world } = this as NonNullableFields<CommandContext>;
        const roomCards = roomCardsModels
            .map(roomCardModel => world.cards.find(card => card.model === roomCardModel))
            .filter(card => !!card);

        scene.interactive = true;

        const cardPointerDownWatcherFork = yield fork(function* worker(): Generator<any, void, any> {
            try {
                while (true) {
                    roomCards.forEach(card => card.interactive = true);
                    const [pointerDownEvent] = yield takeEmitterEvent(scene, "pointerdown");
                    roomCards.forEach(card => card.interactive = false);

                    yield delay(300);
                    const cardDragContext: CardsDragContext = yield call(onPointerDownWorker, pointerDownEvent, roomCards);

                    if (cardDragContext) {
                        const dungeonDeckSendor = world.sensors.find(sensor => sensor.label === "Sensor:DungeonDeck")!;

                        const onDungeonDeckSensorEnterWatcherFork = yield takeEveryEmitterEvent(dungeonDeckSendor, "pointerenter", function* (event) {
                            cardDragContext.isAboveDungeonCardsDeck = true;

                            const animateDepositDraggedCardsStackFork = yield fork(animateDepositDraggedCardsStack, cardDragContext.draggedCardsStack);
                            yield takeEmitterEvent(dungeonDeckSendor, "pointerleave");

                            cardDragContext.isAboveDungeonCardsDeck = false;
                            yield cancel(animateDepositDraggedCardsStackFork);
                            yield call(animateRetrieveDraggedCardsStack, cardDragContext.draggedCardsStack);
                        })

                        const onPointerMoveWatcherFork = yield takeEveryEmitterEvent(scene, "pointermove", function* (event) {
                            yield call(onPointerMoveWorker, event, cardDragContext)
                        });

                        yield takeEmitterEvent(scene, "pointerup");
                        yield cancel(onPointerMoveWatcherFork);
                        yield cancel(onDungeonDeckSensorEnterWatcherFork);

                        if (cardDragContext.isAboveDungeonCardsDeck) {
                            cardDragContext.draggedCardsStack.destroy();
                            yield call(acceptDepositedRoomCards, cardDragContext.draggedCardsStack);
                            yield cancel(cardPointerDownWatcherFork);
                        }
                        else {
                            yield call(animateReturnDraggedCardsToRoomPositions, cardDragContext.draggedCardsStack);
                        }
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

function* onPointerDownWorker(event: FederatedPointerEvent, roomCards: PerspectiveCard[]): Generator<any, CardsDragContext | undefined, any> {
    if (event.target instanceof PerspectiveCard) {
        const draggedCard = event.target;
        const commandContext = yield* getCommandContext();
        const { world } = commandContext as NonNullableFields<CommandContext>;
        const worldPoint = world.toLocal(event.global);
        const draggedCardsStack = new DraggedCardsStack([draggedCard, ...roomCards.filter(predicateCard => predicateCard !== draggedCard)], world.camera);
        const ray = world.camera.createRay(worldPoint.x, worldPoint.y);
        const cardsPlane = vec3.fromValues(0, 0, 1);
        const intersection = ray.intersectPlane([draggedCard.position3D.x, draggedCard.position3D.y, draggedCard.position3D.z], cardsPlane);

        draggedCardsStack.position3D.copyFrom(event.target.position3D);
        draggedCardsStack.topCard.zIndex = 0.4;

        for (let i = 0; i < draggedCardsStack.followerCards.length; i++) {
            const followerCard = draggedCardsStack.followerCards[i];
            followerCard.zIndex = (draggedCardsStack.followerCards.length - i - 1) * 0.1;
        }

        return {
            dragStartIntersectionPoint: vec3.copy(vec3.create(), intersection!.point),
            isAboveDungeonCardsDeck: false,
            draggedCardsStack
        };
    }
}

function* onPointerMoveWorker(event: FederatedPointerEvent, cardDragContext: CardsDragContext): Generator<any, void, any> {
    if (cardDragContext.isAboveDungeonCardsDeck) return;

    const commandContext = yield* getCommandContext();
    const { world } = commandContext as NonNullableFields<CommandContext>;
    const { dragStartIntersectionPoint, draggedCardsStack } = cardDragContext;
    const worldPoint = world.toLocal(event.global);
    const ray = world.camera.createRay(worldPoint.x, worldPoint.y);
    const cardsPlane = vec3.fromValues(0, 0, 1);
    const draggedCard = draggedCardsStack.topCard;
    const intersection = ray.intersectPlane([draggedCard.position3D.x, draggedCard.position3D.y, draggedCard.position3D.z], cardsPlane)!;
    const delta = vec3.sub(vec3.create(), intersection.point, dragStartIntersectionPoint);

    draggedCardsStack.position3D.set(
        draggedCardsStack.position3D.x + delta[0],
        draggedCardsStack.position3D.y + delta[1],
        draggedCardsStack.position3D.z + delta[2]
    );

    vec3.copy(dragStartIntersectionPoint, intersection.point);
}

function* acceptDepositedRoomCards(draggedCardsStack: DraggedCardsStack) {
    const commandContext = yield* getCommandContext();
    const { world, model } = commandContext as NonNullableFields<CommandContext>;
    const roundModel = model.round!;

    yield call(animateLiftDungeonDeck, world.layout.getDungeonDeckCardPosition(draggedCardsStack.cards.length).z);

    for (let i = 0; i < roundModel.roomCards.length; i++) {
        const roomCardModel = roundModel.roomCards[i]!;

        roundModel.dungeonCards.unshift(roomCardModel);
        roundModel.roomCards[i] = null;
    }

    for (let i = 0; i < roundModel.dungeonCards.length; i++) {
        const dungeonCardModel = roundModel.dungeonCards[i]!;
        const dungeonCard = world.cards.find(predicateCard => predicateCard.model === dungeonCardModel)!;

        dungeonCard.position3D = world.layout.getDungeonDeckCardPosition(i);
        dungeonCard.zIndex = world.layout.getDungeonDeckCardZIndex(i);
        dungeonCard.updatePerspective(world.camera);
    }
}

type CardsDragContext = {
    dragStartIntersectionPoint: vec3,
    isAboveDungeonCardsDeck: boolean,
    draggedCardsStack: DraggedCardsStack
}