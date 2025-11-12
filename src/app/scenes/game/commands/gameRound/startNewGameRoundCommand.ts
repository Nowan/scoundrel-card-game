import { call, race } from "redux-saga/effects";
import { GameModel } from "../../models";
import { FunctionalCommand } from "../Command";
import { dealDungeonCardsCommand, dealRoomCardsCommand } from "../card";
import { faceRoomCommand } from "./faceRoomCommand";
import { skipRoomCommand } from "./skipRoomCommand";

export const startNewGameRoundCommand: FunctionalCommand = (
    function* startNewGameRoundCommand() {
        const roundModel = this.context.model.initGameRound();

        yield call(dealDungeonCardsCommand.bind(this, ...roundModel.dungeonCards));

        while (roundModel.dungeonCards.length + roundModel.getFreeRoomSpacesCount() > GameModel.CARDS_DEALT_PER_ROOM) {
            const roomCards = roundModel.pickTopCardsFromDeck(roundModel.getFreeRoomSpacesCount());

            yield call(dealRoomCardsCommand.bind(this, ...roomCards));

            const { faceRoomCommandResult, skipRoomCommandResult } = yield race({
                faceRoomCommandResult: call(faceRoomCommand.bind(this)),
                skipRoomCommandResult: call(skipRoomCommand.bind(this))
            });

            console.log(skipRoomCommandResult, faceRoomCommandResult);

            for (let i = 0; i < roundModel.roomCards.length; i++) {
                roundModel.roomCards[i] = null;
            }
        }
    }
);
