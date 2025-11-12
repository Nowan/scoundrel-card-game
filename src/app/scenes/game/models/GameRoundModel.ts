import { FixedLengthArray, shuffle } from "../../../core/utils";
import { CardModel } from "./CardModel";
import { composeCardsDeck } from "./composeCardsDeck";
import seedrandom, { PRNG } from "seedrandom";
import { GameModel } from "./GameModel";

export class GameRoundModel {
    public readonly seed: string;
    public readonly dungeonCards: CardModel[];
    public readonly roomCards: FixedLengthArray<CardModel | null, typeof GameModel["CARDS_DEALT_PER_ROOM"]>;

    private readonly _rng: PRNG;

    constructor(seed: string) {
        this._rng = seedrandom(seed);

        this.seed = seed;
        this.dungeonCards = shuffle(composeCardsDeck(), this._rng);
        this.roomCards = Array(GameModel.CARDS_DEALT_PER_ROOM).fill(null) as GameRoundModel["roomCards"];
    }

    pickTopCardsFromDeck(numberOfCards: number): CardModel[] {
        return this.dungeonCards.slice(-numberOfCards).reverse();
    }

    pickFreeRoomCardSpace(): number | null {
        for (let i = 0; i < GameModel.CARDS_DEALT_PER_ROOM; i++) {
            if (this.roomCards[i] === null) return i;
        }

        return null;
    }

    getFreeRoomCardSpaceIndexes(): number[] {
        const freeSpaceIndexes = [];

        for (let i = 0; i < GameModel.CARDS_DEALT_PER_ROOM; i++) {
            if (this.roomCards[i] === null) {
                freeSpaceIndexes.push(i);
            }
        }

        return freeSpaceIndexes;
    }

    getFreeRoomSpacesCount() {
        return this.getFreeRoomCardSpaceIndexes().length;
    }
}