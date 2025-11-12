import { animate } from "motion";
import { CardModel } from "../../models";
import { FunctionalCommand } from "../Command";
import type { PerspectiveCard } from "../../components/card";
import { all, delay, call } from "redux-saga/effects";
import { queue } from "../../../../core/utils";

export const discardRoomCardsCommand: FunctionalCommand = (
    function* discardRoomCardsCommand(...cardsModels: CardModel[]) {
        yield all(cardsModels.map((cardModel, i) => (
            queue([
                delay(i * 200),
                call(discardRoomCardCommand.bind(this, cardModel))
            ])
        )));
    }
);

const discardRoomCardCommand: FunctionalCommand = (
    function* discardRoomCardCommand(cardModel: CardModel) {
        const world = this.world!;
        const card = world.cards.find(card => card.model === cardModel);
        const roundModel = this.model.round!;

        if (card && roundModel.roomCards.includes(card.model)) {
            roundModel.roomCards[roundModel.roomCards.indexOf(card.model)] = null;

            yield animate(card.position3D, world.layout.slots.discardCards.position3D, {
                duration: 1,
                onUpdate: () => card.updatePerspective(world.camera)
            });
        }
    }
);