import { GameRoundModel } from "./GameRoundModel";

export class GameModel {
    static CARDS_DEALT_PER_ROOM = 4;

    public currentRound: GameRoundModel | null = null;

    public initGameRound(): GameRoundModel {
        return this.currentRound = new GameRoundModel(`${Date.now()}`);
    }
}