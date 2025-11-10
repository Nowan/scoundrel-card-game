import { Scene } from "../../core/sceneManagement";
import { Game } from "./Game";
import { Assets, Ticker } from "pixi.js";
import { Viewport, GameWorld } from "./components";
import { GameModel } from "./models/GameModel";

export class GameScene extends Scene {
    private _viewport: Viewport = this._createViewport();
    private _game: Game | null = null;
    private _gameModel = new GameModel();
    private _world: GameWorld | null = null;

    public async load(): Promise<void> {
        await Assets.loadBundle("game-scene");
    }

    public init(): void {
        this._game = this._createGame();
        this._world = this._createWorld(this._viewport);

        this._game.start();
    }

    public resize(width: number, height: number): void {
        this._viewport.resize(width, height);
        this._viewport.fitToWorld();
    }

    public update(ticker: Ticker): void {
        this._world?.update(ticker);
    }

    public destroy() {
        this._game?.stop();
    }

    private _createViewport(): Viewport {
        return this.addChild(
            new Viewport({
                screenWidth: this.renderer.width,
                screenHeight: this.renderer.height,
                worldWidth: this.renderer.width,
                worldHeight: this.renderer.height,
            })
        );
    }

    private _createWorld(viewport: Viewport): GameWorld {
        const world = new GameWorld();
        viewport.worldWidth = world.bounds.width;
        viewport.worldHeight = world.bounds.height;
        viewport.fitToWorld();
        return viewport.worldContainer.addChild(world)
    }

    private _createGame(): Game {
        const game = new Game();

        // TODO: Assign event listeners

        return game;
    }
}

export default GameScene;