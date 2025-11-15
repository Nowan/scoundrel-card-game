import { Container, Graphics, Rectangle, Ticker } from "pixi.js";
import { PerspectiveCamera } from "../../../../core/utils";
import { GameWorldLayout } from "./layout";
import { GameWorldSpawner } from "./spawner";
import { GameModel } from "../../models/GameModel";
import { PerspectiveCard } from "../card";
import { SensorRect } from "../sensor";

/**
 * The game world container - renders all of the game world elements that are not part of the UI and overlays
 */
export class GameWorld extends Container {
    readonly bounds = new Rectangle(0, 0, 800, 600);

    camera: PerspectiveCamera = new PerspectiveCamera({
        position: { x: 0, y: 1800, z: 1000 },
        lookAt: { x: 0, y: 200, z: 0 },
        fieldOfView: 40,
        viewport: { width: this.bounds.width, height: this.bounds.height }
    });

    layout: GameWorldLayout = new GameWorldLayout(GameModel.CARDS_DEALT_PER_ROOM);
    spawner: GameWorldSpawner = new GameWorldSpawner(this);
    cards: PerspectiveCard[] = [];
    sensors: SensorRect[] = [];

    constructor() {
        super();

        this.addChild(new Graphics().rect(0, 0, this.bounds.width, this.bounds.height).fill("darkgreen"));

        (window as any).camera = this.camera;

        this.interactive = true;

        const dungeonDeckSensor = this.addChild(new SensorRect(200, 200));
        dungeonDeckSensor.position.set(165, 50);
        dungeonDeckSensor.label = "Sensor:DungeonDeck";
        this.sensors.push(dungeonDeckSensor);
    }

    public update(ticker: Ticker): void {
        // 
    }
}

export default GameWorld;