import { FunctionalCommand } from "../Command";
import type { CardModel } from "../../models/CardModel";
import { all, call, delay } from "redux-saga/effects";
import { queue } from "../../../../core/utils";
import { animate } from "animejs";

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
        const targetCardPosition = world.layout.getDungeonDeckCardPosition(cardOrdinal);
        const card = world.spawner.spawnCard(cardModel, spawnPosition);

        card.zIndex = world.layout.getDungeonDeckCardZIndex(cardOrdinal);
        card.rotation3D.y = 180;

        yield animate(card.position3D, {
            ...targetCardPosition,
            duration: 1000,
            onUpdate: () => card.updatePerspective(world.camera)
        });
    }
)