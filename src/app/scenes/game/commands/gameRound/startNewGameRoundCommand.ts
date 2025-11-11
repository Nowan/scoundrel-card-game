import { GameModel } from "../../models";
import { FunctionalCommand } from "../Command";
import { dealDeckCardsCommand, dealRoomCardsCommand } from "../card";

export const startNewGameRoundCommand: FunctionalCommand = (
    async function startNewGameRoundCommand() {
        const roundModel = this.context.model.initGameRound();
        const firstRoomCards = roundModel.pickTopCardsFromDeck(GameModel.CARDS_DEALT_PER_ROOM);
        // console.log(roomCards);
        // const initialRoomCards = this.context.model
        await dealDeckCardsCommand.call(this, ...roundModel.deckCards);
        await dealRoomCardsCommand.call(this, ...firstRoomCards);
    }
);
