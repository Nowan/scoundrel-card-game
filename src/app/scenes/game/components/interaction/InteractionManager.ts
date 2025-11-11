import { EventEmitter } from "pixi.js";
import GameScene from "../../GameScene";

export class InteractionManager extends EventEmitter {
    private _scene: GameScene;

    constructor(scene: GameScene) {
        super();

        this._scene = scene;
    }
}