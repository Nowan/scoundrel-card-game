import { Scene } from "../../core/sceneManagement";
import { Assets, Ticker } from "pixi.js";
import { Viewport, GameWorld } from "./components";
import { GameModel } from "./models/GameModel";
import { CommandExecutor, startNewGameRoundCommand } from "./commands";
import { InteractionManager } from "./components/interaction";

export class GameScene extends Scene {
    public model: GameModel = new GameModel();
    public world: GameWorld | null = null;
    public viewport: Viewport = this._createViewport();
    public cmd: CommandExecutor = new CommandExecutor(this);
    public interaction: InteractionManager = new InteractionManager(this);

    public async load(): Promise<void> {
        await Assets.loadBundle("game-scene");
    }

    public init(): void {
        this.world = this._createWorld(this.viewport);

        // this.cmd.execute(startNewGameRoundCommand);
    }

    public resize(width: number, height: number): void {
        this.viewport.resize(width, height);
        this.viewport.fitToWorld();
    }

    public update(ticker: Ticker): void {
        this.world?.update(ticker);
    }

    public destroy() {
        // this.game?.stop();
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
}

export default GameScene;