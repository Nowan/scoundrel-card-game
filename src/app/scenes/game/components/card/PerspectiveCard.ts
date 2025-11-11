import { Graphics, PerspectiveMesh, Point, Texture, TextureSourceLike } from "pixi.js";
import { PointData3D } from "../../../../core/utils/perspective/PointData3D";
import { PerspectiveCamera } from "../../../../core/utils";
import { animate } from "motion";
import { CardModel, CardRank, CardSuit } from "../../models";
import { mapToCardFaceTexture } from "./mapToCardFaceTexture";

export class PerspectiveCard extends PerspectiveMesh {
    public readonly model: CardModel;

    public side: CardSide;
    public position3D: PointData3D = { x: 0, y: 0, z: 0 };
    public rotation3D: PointData3D = { x: 0, y: 0, z: 0 };
    public corners3D: [PointData3D, PointData3D, PointData3D, PointData3D] = [
        { x: 0, y: 0, z: 0 },
        { x: this.texture.width, y: 0, z: 0 },
        { x: this.texture.width, y: this.texture.height, z: 0 },
        { x: 0, y: this.texture.height, z: 0 },
    ]

    private _sideToTextureMap: Map<CardSide, Texture>;

    constructor(model: CardModel) {
        super({
            texture: mapToCardFaceTexture(model.rank, model.suit),
            verticesX: 2,
            verticesY: 2,
        });

        this.model = model;
        this.side = CardSide.FRONT;

        this._sideToTextureMap = new Map<CardSide, Texture>([
            [CardSide.BACK, Texture.from("assets/textures/cards-backs/default.png")],
            [CardSide.FRONT, this.texture]
        ]);

        this.addChild(new Graphics().circle(0, 0, 5).fill(0xffffff));
    }

    public get rank() {
        return this.model.rank;
    }

    public get suit() {
        return this.model.suit;
    }

    public flip(camera: PerspectiveCamera) {
        switch (this.side) {
            case CardSide.FRONT:
                this.rotation3D.y = 180;
                this.updatePerspective(camera);
                break;
            case CardSide.BACK:
                this.rotation3D.y = 0;
                this.updatePerspective(camera);
        }
    }

    public async animateFlip(camera: PerspectiveCamera) {
        switch (this.side) {
            case CardSide.FRONT: return await this._animateFlipToBackFace(camera);
            case CardSide.BACK: return await this._animateFlipToFrontFace(camera);
        }
    }

    public updatePerspective(camera: PerspectiveCamera) {
        const corners = camera.transform(this.corners3D, this.position3D, this.rotation3D);

        this.setCorners(
            corners[0].x, corners[0].y,
            corners[1].x, corners[1].y,
            corners[2].x, corners[2].y,
            corners[3].x, corners[3].y
        );

        this._updateSide(corners);
    }

    private async _animateFlipToFrontFace(camera: PerspectiveCamera) {
        await animate(this.rotation3D, { y: 0 }, {
            duration: 1,
            onUpdate: () => this.updatePerspective(camera)
        });
    }

    private async _animateFlipToBackFace(camera: PerspectiveCamera) {
        await animate(this.rotation3D, { y: 180 }, {
            duration: 1,
            onUpdate: () => this.updatePerspective(camera)
        });
    }

    private _updateSide(corners: [PointData3D, PointData3D, PointData3D, PointData3D]) {
        const area = this._computePolygonArea(corners);
        const nextSide = area < 0 ? CardSide.FRONT : CardSide.BACK;

        if (nextSide !== this.side) {
            // console.log(this.side, nextSide, this);
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

export enum CardSide {
    FRONT = "CardSide:Front",
    BACK = "CardSide:Back"
}

export type CardPerspectiveData = {
    rotation: PointData3D,
    offset: PointData3D,
    corners: [PointData3D, PointData3D, PointData3D, PointData3D]
}