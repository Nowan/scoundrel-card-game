import { Ticker, EventEmitter } from "pixi.js";
import App from "../../App";
import Scene from "./Scene";

export class SceneDirector extends EventEmitter<Event> {
    private _app: App;
    private _activeScene: Scene | null;

    constructor(app: App) {
        super();

        this._app = app;
        this._activeScene = null;
    }

    public async init(): Promise<void> {
        this._app.renderer.on("resize", this._resizeActiveScene.bind(this));
    }

    public goTo(Scene: SceneConstructor, ...args: Array<any>): void {
        const scene = new Scene({ director: this, renderer: this._app.renderer });

        scene.load().then(() => {
            scene.init(...args);
            this._resizeScene(scene);

            if (scene.update) {
                scene.ticker.add(scene.update);
                scene.ticker.start();
            }

            if (this._activeScene) {
                this._activeScene.ticker.stop();
                this._activeScene.destroy();
                this._app.stage.removeChild(this._activeScene);
            }

            this._app.stage.addChild(scene);
            this._activeScene = scene;
        });
    }

    private _resizeActiveScene(): void {
        if (this._activeScene) {
            this._resizeScene(this._activeScene);
        }
    }

    private _resizeScene(scene: Scene): void {
        scene.resize(this._app.renderer.width, this._app.renderer.height);
    }
}

type SceneConstructor = new (...args: any[]) => Scene;

export default SceneDirector;