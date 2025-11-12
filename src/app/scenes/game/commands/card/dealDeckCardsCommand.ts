import { animate } from "motion";
import { FunctionalCommand } from "../Command";
import type { CardModel } from "../../models/CardModel";
import { all, call, delay } from "redux-saga/effects";
import { queue } from "../../../../core/utils";

export const dealDeckCardsCommand: FunctionalCommand = (
    function* dealDeckCardsCommand(...cardsModels: CardModel[]) {
        yield all(cardsModels.map((cardModel, i) => (
            queue([
                delay(i * 30),
                call(dealDeckCardCommand.bind(this, cardModel))
            ])
        )))
    }
);

const dealDeckCardCommand: FunctionalCommand = (
    function* dealDeckCardCommand(cardModel: CardModel) {
        const world = this.world!;
        const spawnPosition = world.layout.slots.cardSpawn.position3D;
        const deckPosition = world.layout.slots.deck.position3D;
        const card = world.spawner.spawnCard(cardModel, spawnPosition);

        card.rotation3D.y = 180;

        yield animate(card.position3D, deckPosition, {
            duration: 1,
            onUpdate: () => card.updatePerspective(world.camera)
        });
    }
)