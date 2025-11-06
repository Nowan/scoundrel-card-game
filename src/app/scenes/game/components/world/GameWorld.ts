import { Container, Graphics, Rectangle } from "pixi.js";

/**
 * The game world container - renders all of the game world elements that are not part of the UI and overlays
 */
export class GameWorld extends Container {
    readonly bounds = new Rectangle(0, 0, 400, 400);

    constructor() {
        super();

        const background = this.addChild(
            new Graphics()
                .rect(0, 0, this.bounds.width, this.bounds.height)
                .fill(0x228B22)
        );
    }
}

export default GameWorld;