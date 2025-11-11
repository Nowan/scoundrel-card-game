import { animate } from "motion";
import { CardModel } from "../../models";
import { FunctionalCommand } from "../Command";
import type { PerspectiveCard } from "../../components/card";

export const dealRoomCardsCommand: FunctionalCommand = (
    async function dealRoomCardsCommand(...cardsModels: CardModel[]) {
        const world = this.world!;
        const cards = cardsModels
            .map(cardModel => world.cards.find(card => card.model === cardModel))
            .filter(card => !!card);

        await Promise.all(cards.map(async (card, i) => {
            await new Promise((resolve) => setTimeout(resolve, 200 * i))
            await dealRoomCardCommand.call(this, card);
        }));
        await Promise.all(cards.map((card) => card.animateFlip(world.camera)));
    }
);

const dealRoomCardCommand: FunctionalCommand = (
    async function dealRoomCardCommand(card: PerspectiveCard) {
        const world = this.world!;
        const roundModel = this.model.currentRound!;
        const freeRoomCardSpace = roundModel.pickFreeRoomCardSpace();

        if (card && freeRoomCardSpace !== null && roundModel.deckCards.includes(card.model)) {
            const freeRoomCardSpaceSlot = world.layout.slots.roomCards[freeRoomCardSpace];

            roundModel.deckCards.splice(roundModel.deckCards.indexOf(card.model), 1);
            roundModel.roomCards[freeRoomCardSpace] = card.model;

            await animate(card.position3D, freeRoomCardSpaceSlot.position3D, {
                duration: 1,
                onUpdate: () => card.updatePerspective(world.camera)
            });
        }
    }
);