import { Texture } from "pixi.js";
import { CardRank, CardSuit } from "../../models";

export function mapToCardFaceTexture(rank: CardRank, suit: CardSuit): Texture {
    const texturePath = suitToRankToTexturePathMap.get(suit)?.get(rank);

    return texturePath ? Texture.from(texturePath) : Texture.EMPTY;
}

const suitToRankToTexturePathMap = new Map<CardSuit, Map<CardRank, string>>([
    [
        CardSuit.HEARTS, new Map([
            [CardRank.TWO, "assets/textures/cards-hearts/hearts_02.png"],
            [CardRank.THREE, "assets/textures/cards-hearts/hearts_03.png"],
            [CardRank.FOUR, "assets/textures/cards-hearts/hearts_04.png"],
            [CardRank.FIVE, "assets/textures/cards-hearts/hearts_05.png"],
            [CardRank.SIX, "assets/textures/cards-hearts/hearts_06.png"],
            [CardRank.SEVEN, "assets/textures/cards-hearts/hearts_07.png"],
            [CardRank.EIGHT, "assets/textures/cards-hearts/hearts_08.png"],
            [CardRank.NINE, "assets/textures/cards-hearts/hearts_09.png"],
            [CardRank.TEN, "assets/textures/cards-hearts/hearts_10.png"],
            [CardRank.JACK, "assets/textures/cards-hearts/hearts_jack.png"],
            [CardRank.QUEEN, "assets/textures/cards-hearts/hearts_queen.png"],
            [CardRank.KING, "assets/textures/cards-hearts/hearts_king.png"],
            [CardRank.ACE, "assets/textures/cards-hearts/hearts_ace.png"]
        ])
    ],
    [
        CardSuit.DIAMONDS, new Map([
            [CardRank.TWO, "assets/textures/cards-diamonds/diamonds_02.png"],
            [CardRank.THREE, "assets/textures/cards-diamonds/diamonds_03.png"],
            [CardRank.FOUR, "assets/textures/cards-diamonds/diamonds_04.png"],
            [CardRank.FIVE, "assets/textures/cards-diamonds/diamonds_05.png"],
            [CardRank.SIX, "assets/textures/cards-diamonds/diamonds_06.png"],
            [CardRank.SEVEN, "assets/textures/cards-diamonds/diamonds_07.png"],
            [CardRank.EIGHT, "assets/textures/cards-diamonds/diamonds_08.png"],
            [CardRank.NINE, "assets/textures/cards-diamonds/diamonds_09.png"],
            [CardRank.TEN, "assets/textures/cards-diamonds/diamonds_10.png"],
            [CardRank.JACK, "assets/textures/cards-diamonds/diamonds_jack.png"],
            [CardRank.QUEEN, "assets/textures/cards-diamonds/diamonds_queen.png"],
            [CardRank.KING, "assets/textures/cards-diamonds/diamonds_king.png"],
            [CardRank.ACE, "assets/textures/cards-diamonds/diamonds_ace.png"]
        ])
    ],
    [
        CardSuit.CLUBS, new Map([
            [CardRank.TWO, "assets/textures/cards-clubs/clubs_02.png"],
            [CardRank.THREE, "assets/textures/cards-clubs/clubs_03.png"],
            [CardRank.FOUR, "assets/textures/cards-clubs/clubs_04.png"],
            [CardRank.FIVE, "assets/textures/cards-clubs/clubs_05.png"],
            [CardRank.SIX, "assets/textures/cards-clubs/clubs_06.png"],
            [CardRank.SEVEN, "assets/textures/cards-clubs/clubs_07.png"],
            [CardRank.EIGHT, "assets/textures/cards-clubs/clubs_08.png"],
            [CardRank.NINE, "assets/textures/cards-clubs/clubs_09.png"],
            [CardRank.TEN, "assets/textures/cards-clubs/clubs_10.png"],
            [CardRank.JACK, "assets/textures/cards-clubs/clubs_jack.png"],
            [CardRank.QUEEN, "assets/textures/cards-clubs/clubs_queen.png"],
            [CardRank.KING, "assets/textures/cards-clubs/clubs_king.png"],
            [CardRank.ACE, "assets/textures/cards-clubs/clubs_ace.png"]
        ])
    ],
    [
        CardSuit.SPADES, new Map([
            [CardRank.TWO, "assets/textures/cards-spades/spades_02.png"],
            [CardRank.THREE, "assets/textures/cards-spades/spades_03.png"],
            [CardRank.FOUR, "assets/textures/cards-spades/spades_04.png"],
            [CardRank.FIVE, "assets/textures/cards-spades/spades_05.png"],
            [CardRank.SIX, "assets/textures/cards-spades/spades_06.png"],
            [CardRank.SEVEN, "assets/textures/cards-spades/spades_07.png"],
            [CardRank.EIGHT, "assets/textures/cards-spades/spades_08.png"],
            [CardRank.NINE, "assets/textures/cards-spades/spades_09.png"],
            [CardRank.TEN, "assets/textures/cards-spades/spades_10.png"],
            [CardRank.JACK, "assets/textures/cards-spades/spades_jack.png"],
            [CardRank.QUEEN, "assets/textures/cards-spades/spades_queen.png"],
            [CardRank.KING, "assets/textures/cards-spades/spades_king.png"],
            [CardRank.ACE, "assets/textures/cards-spades/spades_ace.png"]
        ])
    ]
]);