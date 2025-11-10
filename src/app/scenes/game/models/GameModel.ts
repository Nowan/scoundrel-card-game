import { GameRoundModel } from "./GameRoundModel";

export class GameModel {
    public round: GameRoundModel | null = null;

    constructor() {
        this.round = new GameRoundModel(`${Date.now()}`);
    }
}