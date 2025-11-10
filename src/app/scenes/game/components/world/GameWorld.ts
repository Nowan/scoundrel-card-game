import { Container, Graphics, Rectangle, Ticker } from "pixi.js";
import { PerspectiveCard } from "../card";
import { PerspectiveCamera } from "../../../../core/utils";
import { CardSuit } from "../../models";

/**
 * The game world container - renders all of the game world elements that are not part of the UI and overlays
 */
export class GameWorld extends Container {
    readonly bounds = new Rectangle(0, 0, 400, 400);

    cards: PerspectiveCard[] = [];
    camera: PerspectiveCamera = new PerspectiveCamera({ x: 0, y: 2000, z: 2000 }, { x: 0, y: 0, z: 0 }, 45);

    constructor() {
        super();

        this.addChild(new Graphics().rect(0, 0, this.bounds.width, this.bounds.height).fill("darkgreen"));

        for (let i = 0; i < 4; i++) {
            const card = new PerspectiveCard(i + 2, CardSuit.DIAMONDS);
            card.perspective.offset.x = (i - 2) * (card.texture.width + 20);
            this.cards.push(this.addChild(card));
        }

        (window as any).camera = this.camera;

        this.cards.forEach((card, i) => {
            card.updatePerspective(this.camera);
            card.interactive = true;
            card.on("click", () => card.flip(this.camera));
        })
    }

    public update(ticker: Ticker): void {
        // No logic yet
    }
}

export default GameWorld;