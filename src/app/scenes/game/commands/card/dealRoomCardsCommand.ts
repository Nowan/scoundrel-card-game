import { animate } from "motion";
import { CardModel } from "../../models";
import { FunctionalCommand } from "../Command";
import type { PerspectiveCard } from "../../components/card";
import { all, delay, call } from "redux-saga/effects";
import { queue } from "../../../../core/utils";

export const dealRoomCardsCommand: FunctionalCommand = (
    function* dealRoomCardsCommand(...cardsModels: CardModel[]) {
        const world = this.world!;
        const cards = cardsModels
            .map(cardModel => world.cards.find(card => card.model === cardModel))
            .filter(card => !!card);

        yield all(cards.map((card, i) => (
            queue([
                delay(i * 200),
                call(dealRoomCardCommand.bind(this, card))
            ])
        )));

        yield all(cards.map(card => card.animateFlip(world.camera)));
    }
);

const dealRoomCardCommand: FunctionalCommand = (
    function* dealRoomCardCommand(card: PerspectiveCard) {
        const world = this.world!;
        const roundModel = this.model.round!;
        const freeRoomCardSpace = roundModel.pickFreeRoomCardSpace();

        if (card && freeRoomCardSpace !== null && roundModel.deckCards.includes(card.model)) {
            const freeRoomCardSpaceSlot = world.layout.slots.roomCards[freeRoomCardSpace];

            roundModel.deckCards.splice(roundModel.deckCards.indexOf(card.model), 1);
            roundModel.roomCards[freeRoomCardSpace] = card.model;

            yield animate(card.position3D, freeRoomCardSpaceSlot.position3D, {
                duration: 1,
                onUpdate: () => card.updatePerspective(world.camera)
            });
        }
    }
);