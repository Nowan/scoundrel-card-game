import { animate } from "motion";
import { FunctionalCommand } from "../Command";
import type { CardModel } from "../../models/CardModel";
import { all, call, delay } from "redux-saga/effects";
import { queue } from "../../../../core/utils";

export const dealDungeonCardsCommand: FunctionalCommand = (
    function* dealDungeonCardsCommand(...cardsModels: CardModel[]) {
        yield all(cardsModels.map((cardModel, i) => (
            queue([
                delay(i * 30),
                call(dealDungeonCardCommand.bind(this, cardModel, i))
            ])
        )))
    }
);

const dealDungeonCardCommand: FunctionalCommand = (
    function* dealDungeonCardCommand(cardModel: CardModel, cardOrdinal: number = 0) {
        const world = this.world!;
        const spawnPosition = world.layout.slots.cardSpawn.position3D;
        const deckPosition = world.layout.slots.dungeonDeck.position3D;
        const targetCardPosition = { ...deckPosition, z: cardOrdinal * 1.5 };
        const card = world.spawner.spawnCard(cardModel, spawnPosition);

        card.rotation3D.y = 180;

        yield animate(card.position3D, targetCardPosition, {
            duration: 1,
            onUpdate: () => card.updatePerspective(world.camera)
        });
    }
)