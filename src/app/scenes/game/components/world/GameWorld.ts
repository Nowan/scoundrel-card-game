import { Container, Rectangle, Ticker } from "pixi.js";
import { PerspectiveCard } from "./PerspectiveCard";
import { PerspectiveCamera } from "./PerspectiveCamera";

/**
 * The game world container - renders all of the game world elements that are not part of the UI and overlays
 */
export class GameWorld extends Container {
    readonly bounds = new Rectangle(0, 0, 400, 400);

    cards: PerspectiveCard[] = [];
    camera: PerspectiveCamera = new PerspectiveCamera({ x: 0, y: 2000, z: 2000 }, { x: 0, y: 0, z: 0 }, 45);

    constructor() {
        super();

        for (let i = 0; i < 4; i++) {
            const card = new PerspectiveCard(`assets/textures/cards-spades/spades_0${i + 2}.png`);
            card.position.set(-200, -200);
            card.alpha = 0.2
            this.cards.push(this.addChild(card));
        }

        (window as any).camera = this.camera;
    }

    public update(ticker: Ticker): void {
        this.cards.forEach((card, i, cards) => {
            const cardPosition = { x: this.camera.position.x - ((i + 1) - cards.length * 0.5) * 600, y: 0, z: 0 };
            const cardRotation = { x: 0, y: 0, z: 0 };

            cardRotation.y = Math.sin(ticker.lastTime / 1000) * 360;

            this.camera.applyPerspective(card, cardPosition, cardRotation);
        })
    }

}

export default GameWorld;