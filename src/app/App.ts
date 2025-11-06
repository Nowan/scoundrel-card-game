import { Application, ApplicationOptions, Assets, AssetsManifest } from "pixi.js";
import { SceneDirector } from "./core/sceneManagement";
import { GameScene } from "./scenes";

export class App extends Application {
    public director: SceneDirector = new SceneDirector(this);

    async init(options: Partial<ApplicationOptions> = {}): Promise<void> {
        await super.init(Object.assign(defaultAppOptions, options));
        await this._initDirector();
        await this._initAssets();
    }

    public startAtInitialScene(): void {
        this.director.goTo(GameScene)
    }

    private async _initDirector(): Promise<void> {
        return await this.director.init();
    }

    private async _initAssets(): Promise<void> {
        const manifest = await fetch("assets/manifest.json").then(response => response.json()) as AssetsManifest;
        return await Assets.init({ manifest });
    }
}

const defaultAppOptions = {
    backgroundColor: 0x000000
};

export default App;