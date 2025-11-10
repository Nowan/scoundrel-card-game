import { Graphics, PerspectiveMesh, Point, Texture, TextureSourceLike } from "pixi.js";
import { PointData3D } from "../../../../core/utils/perspective/PointData3D";
import { PerspectiveCamera } from "../../../../core/utils";
import { animate } from "motion";
import { CardRank, CardSuit } from "../../models";
import { mapToCardFaceTexture } from "./mapToCardFaceTexture";

export class PerspectiveCard extends PerspectiveMesh {
    public readonly perspective: CardPerspectiveData = createPerspectiveData(this)
    public readonly suit: CardSuit;
    public readonly rank: CardRank;
    public side: CardSide;

    private _sideToTextureMap: Map<CardSide, Texture>;

    constructor(rank: CardRank, suit: CardSuit) {
        super({
            texture: mapToCardFaceTexture(rank, suit),
            verticesX: 2,
            verticesY: 2,
        });

        this.rank = rank;
        this.suit = suit;
        this.side = CardSide.FRONT;

        this._sideToTextureMap = new Map<CardSide, Texture>([
            [CardSide.BACK, Texture.from("assets/textures/cards-backs/default.png")],
            [CardSide.FRONT, this.texture]
        ]);

        this.addChild(new Graphics().circle(0, 0, 5).fill(0xffffff));
    }

    public async flip(camera: PerspectiveCamera) {
        switch (this.side) {
            case CardSide.FRONT: return await this._flipToBackFace(camera);
            case CardSide.BACK: return await this._flipToFrontFace(camera);
        }
    }

    public updatePerspective(camera: PerspectiveCamera) {
        const corners = camera.transformToViewport(this.perspective.corners, this.perspective.offset, this.perspective.rotation);

        this.setCorners(
            corners[0].x, corners[0].y,
            corners[1].x, corners[1].y,
            corners[2].x, corners[2].y,
            corners[3].x, corners[3].y
        );

        this._updateSide(corners);
    }

    private async _flipToFrontFace(camera: PerspectiveCamera) {
        await animate(this.perspective.rotation, { y: 0 }, {
            duration: 1,
            onUpdate: () => this.updatePerspective(camera)
        });
    }

    private async _flipToBackFace(camera: PerspectiveCamera) {
        await animate(this.perspective.rotation, { y: 180 }, {
            duration: 1,
            onUpdate: () => this.updatePerspective(camera)
        });
    }

    private _updateSide(corners: [PointData3D, PointData3D, PointData3D, PointData3D]) {
        const area = this._computePolygonArea(corners);
        const nextSide = area < 0 ? CardSide.FRONT : CardSide.BACK;

        if (nextSide !== this.side) {
            this.texture = this._sideToTextureMap.get(nextSide)!;
            this.side = nextSide;
        }
    }

    private _computePolygonArea(corners: [PointData3D, PointData3D, PointData3D, PointData3D]): number {
        // https://en.wikipedia.org/wiki/Shoelace_formula
        return (
            (corners[1].x - corners[0].x) * (corners[1].y + corners[0].y) +
            (corners[2].x - corners[1].x) * (corners[2].y + corners[1].y) +
            (corners[3].x - corners[2].x) * (corners[3].y + corners[2].y) +
            (corners[0].x - corners[3].x) * (corners[0].y + corners[3].y)
        );
    }
}

function createPerspectiveData(card: PerspectiveCard): CardPerspectiveData {
    return {
        rotation: { x: 0, y: 0, z: 0 },
        offset: { x: 0, y: 0, z: 0 },
        corners: [
            { x: 0, y: 0, z: 0 },
            { x: card.texture.width, y: 0, z: 0 },
            { x: card.texture.width, y: card.texture.height, z: 0 },
            { x: 0, y: card.texture.height, z: 0 },
        ]
    }
}

export enum CardSide {
    FRONT = "CardSide:Front",
    BACK = "CardSide:Back"
}

export type CardPerspectiveData = {
    rotation: PointData3D,
    offset: PointData3D,
    corners: [PointData3D, PointData3D, PointData3D, PointData3D]
}