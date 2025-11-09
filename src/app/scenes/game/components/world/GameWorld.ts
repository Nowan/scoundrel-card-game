import { Container, Graphics, Rectangle, Ticker } from "pixi.js";
import { PerspectiveCard } from "./PerspectiveCard";
import { PerspectiveCamera } from "../../../../core/utils";
/**
 * The game world container - renders all of the game world elements that are not part of the UI and overlays
 */
export class GameWorld extends Container {
    readonly bounds = new Rectangle(0, 0, 400, 400);

    cards: PerspectiveCard[] = [];
    camera: PerspectiveCamera = new PerspectiveCamera({ x: 0, y: 2000, z: 2000 }, { x: 0, y: 0, z: 0 }, 45);

    constructor() {
        super();

        this.addChild(new Graphics().rect(0, 0, this.bounds.width, this.bounds.height).fill("darkgreen"))
        for (let i = 0; i < 4; i++) {
            const card = new PerspectiveCard(`assets/textures/cards-spades/spades_0${i + 2}.png`);
            card.perspective.offset.x = (i - 2) * 600;
            // card.position.set(-200, -200);
            // card.alpha = 0.2
            this.cards.push(this.addChild(card));
        }

        (window as any).camera = this.camera;

        this.cards.forEach((card, i) => {
            this._updateCardPerspective(card, i);
        })
    }

    public update(ticker: Ticker): void {
        this.cards.forEach((card, i) => {
            card.perspective.rotation.z = Math.sin(ticker.lastTime / 1000) * 360;

            this._updateCardPerspective(card, i);
        })
    }

    private _updateCardPerspective(card: PerspectiveCard, cardIndex: number): void {
        const cardCorners = this.camera.transformToViewport(card.perspective.corners, card.perspective.offset, card.perspective.rotation, this.bounds.width, this.bounds.height);
        card.setCorners(
            cardCorners[0].x, cardCorners[0].y,
            cardCorners[1].x, cardCorners[1].y,
            cardCorners[2].x, cardCorners[2].y,
            cardCorners[3].x, cardCorners[3].y
        );
    }
}

export default GameWorld;