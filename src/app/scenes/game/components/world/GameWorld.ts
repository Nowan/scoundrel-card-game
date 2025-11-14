import { Container, FederatedPointerEvent, Graphics, Rectangle, Ticker } from "pixi.js";
import { PerspectiveCamera, PerspectiveCameraRay } from "../../../../core/utils";
import { GameWorldLayout } from "./layout";
import { GameWorldSpawner } from "./spawner";
import { GameModel } from "../../models/GameModel";
import { PerspectiveCard } from "../card";
import { CardModel, CardSuit } from "../../models";
import { mat4, vec3 } from "gl-matrix";

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

    // Drag state
    private _draggedCard: PerspectiveCard | null = null;
    private _dragPlaneNormal = vec3.fromValues(0, 1, 0);
    private _dragStartOffset = vec3.create();
    private _dragStartRay: PerspectiveCameraRay | null = null;

    constructor() {
        super();

        this.addChild(new Graphics().rect(0, 0, this.bounds.width, this.bounds.height).fill("darkgreen"));
        // let i = 2;
        // for (let cardSlot of this.layout.slots.roomCards) {
        //     const card = this.spawner.spawnCard(new CardModel(i, CardSuit.DIAMONDS), cardSlot.position3D);
        //     i++
        //     card.interactive = true;
        //     card.eventMode = "static";
        //     card.cursor = "pointer";
        //     // card.on("pointerdown", (e) => this._onPointerDown(e, card));
        // }

        (window as any).camera = this.camera;

        this.interactive = true;
    }

    public update(ticker: Ticker): void {
        // 
    }

    private _onPointerDown(event: FederatedPointerEvent, card: PerspectiveCard) {
        event.stopPropagation();

        // Compute intersection ray for the pointer
        const ray = this.camera.createRay(event.global.x, event.global.y);

        // Compute intersection point of the ray with the card’s plane
        const intersection = ray.intersectPlane([card.position3D.x, card.position3D.y, card.position3D.z], card.normal3D);
        if (!intersection) return;

        this._draggedCard = card;
        this._dragPlaneNormal = card.normal3D;
        this._dragStartRay = ray;
        vec3.copy(this._dragStartOffset, intersection.point);

        // Capture global pointer events (works outside card bounds)
        this.on("pointermove", this._onPointerMove, this);
        this.on("pointerup", this._onPointerUp, this);

        card.cursor = "grabbing";
    }

    private _onPointerMove(event: FederatedPointerEvent) {
        if (!this._draggedCard || !this._dragStartRay) return;

        // Current pointer ray
        const ray = this.camera.createRay(event.global.x, event.global.y);

        // Find intersection with same plane as drag start
        const intersection = ray.intersectPlane([this._draggedCard.position3D.x, this._draggedCard.position3D.y, this._draggedCard.position3D.z], this._dragPlaneNormal);
        if (!intersection) return;

        // Compute world-space delta
        const delta = vec3.sub(vec3.create(), intersection.point, this._dragStartOffset);

        // Move card in world-space
        this._draggedCard.position3D.x += delta[0];
        this._draggedCard.position3D.y += delta[1];
        this._draggedCard.position3D.z += delta[2];
        this._draggedCard.updatePerspective(this.camera);

        // Update offset reference so movement is relative
        vec3.copy(this._dragStartOffset, intersection.point);
    }

    private _onPointerUp() {
        if (!this._draggedCard) return;

        this.off("pointermove", this._onPointerMove, this);
        this.off("pointerup", this._onPointerUp, this);

        this._draggedCard.cursor = "pointer";
        this._draggedCard = null;
    }
}

export default GameWorld;