import { GameRoundModel } from "./GameRoundModel";

export class GameModel {
    static CARDS_DEALT_PER_ROOM = 4 as const;

    public round: GameRoundModel | null = null;

    public initGameRound(): GameRoundModel {
        return this.round = new GameRoundModel(`${Date.now()}`);
    }
}