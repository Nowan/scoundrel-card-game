import { PerspectiveMesh, PointData, Texture, TextureSourceLike } from "pixi.js";

export class PerspectiveCard extends PerspectiveMesh {
    public rotation3D: PointData3D = { x: 0, y: 0, z: 0 };

    constructor(source: Texture | TextureSourceLike) {
        super({
            texture: source instanceof Texture ? source : Texture.from(source),
            verticesX: 2,
            verticesY: 2,
        });
    }
}

export type PointData3D = PointData & { z: number };