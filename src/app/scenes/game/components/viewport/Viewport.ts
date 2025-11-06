import { Container } from "pixi.js";

export class Viewport extends Container {
    screenWidth: number = 0;

    screenHeight: number = 0;

    worldWidth: number = 0;

    worldHeight: number = 0;

    worldContainer: Container = this.addChild(new Container());

    constructor(config: ViewportConfig) {
        super();

        this.screenWidth = config.screenWidth;
        this.screenHeight = config.screenHeight;
        this.worldWidth = config.worldWidth;
        this.worldHeight = config.worldHeight;
    }

    public resize(screenWidth: number, screenHeight: number): void {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
    }

    public fitToWorld() {
        const fitScale = Math.min(this.screenWidth / this.worldWidth, this.screenHeight / this.worldHeight);

        this.scale.set(fitScale);
        this.position.set(
            (this.screenWidth - this.worldWidth * fitScale) * 0.5,
            (this.screenHeight - this.worldHeight * fitScale) * 0.5,
        );
    }
}

export type ViewportConfig = {
    screenWidth: number;
    screenHeight: number;
    worldWidth: number;
    worldHeight: number;
}