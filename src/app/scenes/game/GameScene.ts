import { Scene, SceneContext } from "../../core/sceneManagement";
import { Game } from "./Game";
import { Assets, Ticker } from "pixi.js";
import { Viewport, GameWorld } from "./components";

export class GameScene extends Scene {
    private _game: Game | null;
    private _viewport: Viewport;
    private _world: GameWorld;

    constructor(context: SceneContext) {
        super(context);

        this._game = null;
        this._world = new GameWorld();
        this._viewport = this._createViewport(this._world);
    }

    public async load(): Promise<void> {
        await Assets.loadBundle("game-scene");
    }

    public init(): void {
        this._game = this._createGame();

        this._game.start();
    }

    public resize(width: number, height: number): void {
        this._viewport.resize(width, height);
        this._viewport.fitToWorld();
    }

    public update(ticker: Ticker): void {
        this._game?.update(ticker.deltaMS / 1000);
    }

    public destroy() {
        this._game?.stop();
    }

    private _createViewport(gameWorld: GameWorld): Viewport {
        const viewport = new Viewport({
            screenWidth: this.renderer.width,
            screenHeight: this.renderer.height,
            worldWidth: gameWorld.bounds.width,
            worldHeight: gameWorld.bounds.height,
        });

        viewport.worldContainer.addChild(gameWorld);

        return this.addChild(viewport);
    }

    private _createGame(): Game {
        const game = new Game();

        // TODO: Assign event listeners

        return game;
    }
}

export default GameScene;