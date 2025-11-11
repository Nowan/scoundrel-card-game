import { animate } from "motion";
import { FunctionalCommand } from "../Command";
import type { CardModel } from "../../models/CardModel";
import { CardSide } from "../../components/card";

export const spawnCardsToDeckCommand: FunctionalCommand = (
    async function spawnCardsToDeckCommand(...cardsModels: CardModel[]) {
        await Promise.all(cardsModels.map((async (cardModel, i) => {
            await new Promise((resolve) => setTimeout(resolve, 30 * i))
            await spawnCardToDeckCommand.call(this, cardModel);
        })));
    }
);

const spawnCardToDeckCommand: FunctionalCommand = (
    async function spawnCardToDeckCommand(cardModel: CardModel) {
        const world = this.world!;
        const spawnPosition = world.layout.slots.cardSpawn.position3D;
        const deckPosition = world.layout.slots.deck.position3D;
        const card = world.spawner.spawnCard(cardModel.rank, cardModel.suit, spawnPosition);

        card.rotation3D.y = 180;

        await animate(card.position3D, deckPosition, {
            duration: 1,
            onUpdate: () => card.updatePerspective(world.camera)
        });
    }
)