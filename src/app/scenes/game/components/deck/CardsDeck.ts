import { Container } from "pixi.js";
import { PointData3D } from "../../../../core/utils";

export class CardsDeck extends Container {
    public position3D: PointData3D = { x: 0, y: 0, z: 0 };

    constructor() {
        super();
    }
}