import { shuffle } from "../../../core/utils";
import { CardModel } from "./CardModel";
import { composeCardsDeck } from "./composeCardsDeck";
import seedrandom, { PRNG } from "seedrandom";

export class GameRoundModel {
    public readonly seed: string;
    public readonly cardsDeck: CardModel[];

    private readonly _rng: PRNG;

    constructor(seed: string) {
        this._rng = seedrandom(seed);

        this.seed = seed;
        this.cardsDeck = shuffle(composeCardsDeck(), this._rng);
    }
}