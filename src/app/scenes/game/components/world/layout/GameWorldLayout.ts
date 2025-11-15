import { Container, Rectangle } from "pixi.js";
import { FixedLengthArray, PointData3D } from "../../../../../core/utils";
import type { GameModel } from "../../../models";

// same as texture size
export const CARD_WIDTH = 352;
export const CARD_HEIGHT = 512;

export const ROOM_CARDS_GAP_X = CARD_WIDTH * 0.1;

export const DECK_CARDS_GAP_Z = CARD_WIDTH * 0.01;

export class GameWorldLayout extends Container {
    readonly slots: GameWorldLayoutSlots;

    constructor(numberOfRoomCards: number) {
        super();

        this.slots = {
            dungeonDeck: this._createLayoutSlot({ x: -CARD_WIDTH * 1.5, y: -CARD_HEIGHT * 1.2, z: 0 }),
            roomCards: this._createRoomCardsSlots(numberOfRoomCards),
            discardDeck: this._createLayoutSlot({ x: CARD_WIDTH * 0.5, y: -CARD_HEIGHT * 1.2, z: 0 }),
            cardSpawn: this._createLayoutSlot({ x: -CARD_WIDTH * 1.5, y: -CARD_HEIGHT * 1.2, z: 1000 })
        }
    }

    getDungeonCardPosition(ordinal: number = 0) {
        const dungeonDeckPosition = this.slots.dungeonDeck.position3D;
        return {
            ...dungeonDeckPosition,
            z: ordinal * DECK_CARDS_GAP_Z
        }
    }

    private _createRoomCardsSlots(numberOfRoomCards: number): GameWorldLayoutSlots["roomCards"] {
        return Array(numberOfRoomCards)
            .fill(null)
            .map((_, i) => (
                this._createLayoutSlot({
                    x: (i - 2) * (CARD_WIDTH + ROOM_CARDS_GAP_X) + ROOM_CARDS_GAP_X * 0.5,
                    y: 0,
                    z: 0
                })
            )) as GameWorldLayoutSlots["roomCards"];
    }

    private _createLayoutSlot(position3D: PointData3D) {
        return {
            position3D
        }
    }
}

export type GameWorldLayoutSlots = {
    dungeonDeck: GameWorldLayoutSlot,
    roomCards: FixedLengthArray<GameWorldLayoutSlot, typeof GameModel["CARDS_DEALT_PER_ROOM"]>,
    discardDeck: GameWorldLayoutSlot,
    cardSpawn: GameWorldLayoutSlot
}

export type GameWorldLayoutSlot = {
    position3D: PointData3D
}