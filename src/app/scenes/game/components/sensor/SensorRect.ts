import { Container, Graphics, Rectangle, Sprite } from "pixi.js";

export class SensorRect extends Graphics {
    constructor(width: number, height: number) {
        super();
        this.interactive = true;
        this.hitArea = new Rectangle(0, 0, width, height);
        this.zIndex = 1000;
        // this.rect(0, 0, width, height).fill(0xffffff);
    }
}