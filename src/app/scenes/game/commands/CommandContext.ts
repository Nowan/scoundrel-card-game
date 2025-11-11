import GameScene from "../GameScene";
import type { CommandExecutor } from "./CommandExecutor";

export class CommandContext {
    public readonly cmd: CommandExecutor;
    public readonly scene: GameScene;

    constructor(commandExecutor: CommandExecutor, scene: GameScene) {
        this.cmd = commandExecutor;
        this.scene = scene;
    }

    get world() {
        return this.scene.world;
    }

    get model() {
        return this.scene.model;
    }
}