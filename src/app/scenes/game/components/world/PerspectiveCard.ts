import { Graphics, PerspectiveMesh, Texture, TextureSourceLike } from "pixi.js";
import { PointData3D } from "../../../../core/utils/perspective/PointData3D";

export class PerspectiveCard extends PerspectiveMesh {
    public readonly perspective: CardPerspectiveData = {
        rotation: { x: 0, y: 0, z: 0 },
        offset: { x: 0, y: 0, z: 0 },
        corners: [
            { x: 0, y: 0, z: 0 },
            { x: this.texture.width, y: 0, z: 0 },
            { x: this.texture.width, y: this.texture.height, z: 0 },
            { x: 0, y: this.texture.height, z: 0 },
        ]
    }

    constructor(source: Texture | TextureSourceLike) {
        super({
            texture: source instanceof Texture ? source : Texture.from(source),
            verticesX: 2,
            verticesY: 2,
        });

        this.addChild(new Graphics().circle(0, 0, 5).fill(0xffffff));
    }

    // applyCameraTransform(camera: PerspectiveCamera) {
    //     const corners = camera.transformToViewport(this.cornerVertices, this.position3D, this.rotation3D);
    //     this.setCorners(
    //         corners[0].x, corners[0].y,
    //         corners[1].x, corners[1].y,
    //         corners[2].x, corners[2].y,
    //         corners[3].x, corners[3].y
    //     )
    // }
}

export type CardPerspectiveData = {
    rotation: PointData3D,
    offset: PointData3D,
    corners: PointData3D[]
}