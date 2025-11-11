import { FunctionalCommand } from "../Command";
import { spawnCardsToDeckCommand } from "../card";

export const startNewGameRoundCommand: FunctionalCommand = (
    async function startNewGameRoundCommand() {
        const roundModel = this.context.model.initGameRound();

        await spawnCardsToDeckCommand.call(this, ...roundModel.cardsDeck);
    }
);