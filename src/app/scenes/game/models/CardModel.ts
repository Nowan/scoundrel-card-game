import { CardRank } from "./CardRank";
import CardSuit from "./CardSuit";

export class CardModel {
    public readonly rank: CardRank;
    public readonly suit: CardSuit;

    constructor(rank: CardRank, suit: CardSuit) {
        this.rank = rank;
        this.suit = suit;
    }
}