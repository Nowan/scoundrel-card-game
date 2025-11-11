import { Container, Rectangle } from "pixi.js";
import { PointData3D } from "../../../../../core/utils";

// same as texture size
export const CARD_WIDTH = 352;
export const CARD_HEIGHT = 512;

export const CARDS_SPACING = CARD_WIDTH * 0.1;

export class GameWorldLayout extends Container {
    readonly slots: GameWorldLayoutSlots;

    constructor(numberOfRoomCards: number) {
        super();

        this.slots = {
            deck: this._createLayoutSlot({ x: -CARD_WIDTH * 0.5, y: -CARD_HEIGHT * 1.2, z: 0 }),
            roomCards: this._createRoomCardsSlots(numberOfRoomCards),
            cardSpawn: this._createLayoutSlot({ x: -CARD_WIDTH * 0.5, y: -CARD_HEIGHT * 1.2, z: 1000 })
        }
    }

    private _createRoomCardsSlots(numberOfRoomCards: number) {
        return Array(numberOfRoomCards)
            .fill(null)
            .map((_, i) => (
                this._createLayoutSlot({
                    x: (i - 2) * (CARD_WIDTH + CARDS_SPACING) + CARDS_SPACING * 0.5,
                    y: 0,
                    z: 0
                })
            ));
    }

    private _createLayoutSlot(position3D: PointData3D) {
        return {
            position3D
        }
    }
}

export type GameWorldLayoutSlots = {
    deck: GameWorldLayoutSlot,
    roomCards: GameWorldLayoutSlot[],
    cardSpawn: GameWorldLayoutSlot
}

export type GameWorldLayoutSlot = {
    position3D: PointData3D
}