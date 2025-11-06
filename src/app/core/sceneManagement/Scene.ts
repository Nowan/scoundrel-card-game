import { Container, Ticker, Renderer } from "pixi.js";
import SceneDirector from "./SceneDirector";

export type SceneContext = {
    renderer: Renderer;
    director: SceneDirector;
};

export class Scene extends Container {
    public renderer: Renderer;
    public director: SceneDirector;
    public ticker: Ticker;

    constructor(context: SceneContext) {
        super();

        this.renderer = context.renderer;
        this.director = context.director;
        this.ticker = new Ticker();
    }

    async load(): Promise<void> {
        return await Promise.resolve();
    }

    public init(...args: Array<any>): void { }

    public destroy(): void { }

    public resize(width: number, height: number): void { }

    public update?(ticker: Ticker) { }
}

export default Scene;