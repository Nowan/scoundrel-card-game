import { animate } from "motion";
import { FunctionalCommand } from "../Command";
import type { CardModel } from "../../models/CardModel";

export const dealDeckCardsCommand: FunctionalCommand = (
    async function dealDeckCardsCommand(...cardsModels: CardModel[]) {
        await Promise.all(cardsModels.map((async (cardModel, i) => {
            await new Promise((resolve) => setTimeout(resolve, 30 * i))
            await dealDeckCardCommand.call(this, cardModel);
        })));
    }
);

const dealDeckCardCommand: FunctionalCommand = (
    async function dealDeckCardCommand(cardModel: CardModel) {
        const world = this.world!;
        const spawnPosition = world.layout.slots.cardSpawn.position3D;
        const deckPosition = world.layout.slots.deck.position3D;
        const card = world.spawner.spawnCard(cardModel, spawnPosition);

        card.rotation3D.y = 180;

        await animate(card.position3D, deckPosition, {
            duration: 1,
            onUpdate: () => card.updatePerspective(world.camera)
        });
    }
)