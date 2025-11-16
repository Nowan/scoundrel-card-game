import { CardModel } from "../../models";
import { FunctionalCommand } from "../Command";
import { all, delay, call } from "redux-saga/effects";
import { queue } from "../../../../core/utils";
import { animate } from "animejs";

export const dealRoomCardsCommand: FunctionalCommand = (
    function* dealRoomCardsCommand(...roomCardsModels: CardModel[]) {
        const world = this.world!;
        const roomCards = roomCardsModels
            .map(roomCardModel => world.cards.find(card => card.model === roomCardModel))
            .filter(card => !!card);

        yield all(roomCardsModels.map((roomCardModel, i) => (
            queue([
                delay(i * 200),
                call(dealRoomCardCommand.bind(this, roomCardModel))
            ])
        )));

        yield all(roomCards.map(roomCard => (
            animate(roomCard.rotation3D, {
                y: 0,
                onUpdate: () => roomCard.updatePerspective(world.camera)
            }).then()
        )));
    }
);

const dealRoomCardCommand: FunctionalCommand = (
    function* dealRoomCardCommand(roomCardModel: CardModel) {
        const world = this.world!;
        const card = world.cards.find(card => card.model === roomCardModel);
        const roundModel = this.model.round!;
        const freeRoomCardSpace = roundModel.pickFreeRoomCardSpace();

        if (card && freeRoomCardSpace !== null && roundModel.dungeonCards.includes(card.model)) {
            const freeRoomCardSpaceSlot = world.layout.slots.roomCards[freeRoomCardSpace];

            roundModel.dungeonCards.splice(roundModel.dungeonCards.indexOf(card.model), 1);
            roundModel.roomCards[freeRoomCardSpace] = card.model;

            yield animate(card.position3D, {
                ...freeRoomCardSpaceSlot.position3D,
                duration: 1000,
                onUpdate: () => card.updatePerspective(world.camera)
            });
        }
    }
);