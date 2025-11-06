import { EventEmitter } from "pixi.js";
import { GameEvent } from "./events";

/**
 * The main game class to handle game logic and state independently of rendering
 */
export class Game {
    static Event = GameEvent;

    public events: EventEmitter;

    constructor() {
        this.events = new EventEmitter();
    }

    public start() {

    }

    public update(timeSinceLastFrameInS: number) {

    }

    public pause(): void {

    }

    public resume(): void {

    }

    public stop(): void {

    }
}

export default Game;