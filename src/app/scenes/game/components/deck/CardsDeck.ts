import { Container } from "pixi.js";
import { PointData3D } from "../../../../core/utils";
import { PerspectiveCard } from "../card";

export class CardsDeck extends Container {
    public position3D: PointData3D = { x: 0, y: 0, z: 0 };

    public cards: PerspectiveCard[] = [];

    constructor() {
        super();
    }

    hostCard(...cards: PerspectiveCard[]) {
        for (let card of cards) {
            this.cards.push(this.addChild(card));
        }
    }
}