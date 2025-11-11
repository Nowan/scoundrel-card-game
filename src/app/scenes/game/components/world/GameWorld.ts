import { Container, Graphics, Rectangle, Ticker } from "pixi.js";
import { PerspectiveCamera } from "../../../../core/utils";
import { CardSuit } from "../../models";
import { GameWorldLayout } from "./layout";
import { GameWorldSpawner } from "./spawner";
import { GameModel } from "../../models/GameModel";
import { CardsDeck } from "../deck";

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
    deck: CardsDeck = this.addChild(new CardsDeck());

    constructor() {
        super();

        this.addChild(new Graphics().rect(0, 0, this.bounds.width, this.bounds.height).fill("darkgreen"));

        this.deck = this.addChild(new CardsDeck());

        for (let cardSlot of this.layout.slots.roomCards) {
            const card = this.spawner.spawnCard(2, CardSuit.DIAMONDS, cardSlot.position3D);

            card.interactive = true;
            card.on("click", () => card.animateFlip(this.camera));
        }

        (window as any).camera = this.camera;
    }

    public update(ticker: Ticker): void {
        // this.cards.forEach((card, i) => {
        //     card.updatePerspective(this.camera);
        // })
    }
}

export default GameWorld;