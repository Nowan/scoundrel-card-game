import { Container, Graphics, Rectangle, Ticker } from "pixi.js";
import { PerspectiveCard } from "../card";
import { PerspectiveCamera } from "../../../../core/utils";
import { CardSuit } from "../../models";

/**
 * The game world container - renders all of the game world elements that are not part of the UI and overlays
 */
export class GameWorld extends Container {
    readonly bounds = new Rectangle(0, 0, 800, 600);

    cards: PerspectiveCard[] = [];
    camera: PerspectiveCamera = new PerspectiveCamera({
        position: { x: 0, y: 1800, z: 1000 },
        lookAt: { x: 0, y: 0, z: 0 },
        fieldOfView: 40,
        viewport: { width: this.bounds.width, height: this.bounds.height }
    });

    constructor() {
        super();

        this.addChild(new Graphics().rect(0, 0, this.bounds.width, this.bounds.height).fill("darkgreen"));
        const spacing = 20;
        for (let i = 0; i < 4; i++) {
            const card = new PerspectiveCard(i + 2, CardSuit.DIAMONDS);
            card.perspective.offset.x = (i - 2) * (card.texture.width + spacing) + spacing * 0.5;
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
        this.cards.forEach((card, i) => {
            card.updatePerspective(this.camera);
        })
    }
}

export default GameWorld;