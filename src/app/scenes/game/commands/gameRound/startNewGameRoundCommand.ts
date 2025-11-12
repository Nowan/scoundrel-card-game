import { call, race } from "redux-saga/effects";
import { GameModel } from "../../models";
import { FunctionalCommand } from "../Command";
import { dealDeckCardsCommand, dealRoomCardsCommand } from "../card";
import { faceRoomCommand } from "./faceRoomCommand";
import { skipRoomCommand } from "./skipRoomCommand";

export const startNewGameRoundCommand: FunctionalCommand = (
    function* startNewGameRoundCommand() {
        const roundModel = this.context.model.initGameRound();
        const firstRoomCards = roundModel.pickTopCardsFromDeck(GameModel.CARDS_DEALT_PER_ROOM);

        yield call(dealDeckCardsCommand.bind(this, ...roundModel.deckCards));
        yield call(dealRoomCardsCommand.bind(this, ...firstRoomCards));

        const { faceRoomCommandResult, skipRoomCommandResult } = yield race({
            faceRoomCommandResult: call(faceRoomCommand.bind(this)),
            skipRoomCommandResult: call(skipRoomCommand.bind(this))
        });

        console.log(skipRoomCommandResult, faceRoomCommandResult);
    }
);
