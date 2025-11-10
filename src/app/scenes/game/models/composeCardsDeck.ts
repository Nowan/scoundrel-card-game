import { enumValues } from "../../../core/utils";
import { CardModel } from "./CardModel";
import { CardRank } from "./CardRank";
import { CardSuit } from "./CardSuit";

export function composeCardsDeck(): CardModel[] {
    return [
        ...composeMonsterCards(),
        ...composeHealthCards(),
        ...composeWeaponCards()
    ]
}

function composeMonsterCards(): CardModel[] {
    return [CardSuit.CLUBS, CardSuit.SPADES]
        .flatMap(suit => (
            enumValues(CardRank).map(rank => new CardModel(rank, suit))
        ))
}

function composeHealthCards(): CardModel[] {
    const ranksToDiscard = [CardRank.JACK, CardRank.QUEEN, CardRank.KING, CardRank.ACE];

    return enumValues(CardRank)
        .filter(rank => !ranksToDiscard.includes(rank))
        .map(rank => new CardModel(rank, CardSuit.HEARTS))
}

function composeWeaponCards(): CardModel[] {
    const ranksToDiscard = [CardRank.JACK, CardRank.QUEEN, CardRank.KING, CardRank.ACE];

    return enumValues(CardRank)
        .filter(rank => !ranksToDiscard.includes(rank))
        .map(rank => new CardModel(rank, CardSuit.DIAMONDS))
}