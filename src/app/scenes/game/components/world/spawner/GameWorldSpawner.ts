import { PointData3D } from "../../../../../core/utils";
import { CardModel } from "../../../models";
import { PerspectiveCard } from "../../card";
import GameWorld from "../GameWorld";

export class GameWorldSpawner {
    private readonly _world: GameWorld;

    constructor(world: GameWorld) {
        this._world = world;
    }

    public spawnCard(model: CardModel, position3D: PointData3D = this._world.layout.slots.cardSpawn.position3D): PerspectiveCard {
        const card = new PerspectiveCard(model);
        card.position3D = { ...position3D };
        card.updatePerspective(this._world.camera);
        this._world.cards.push(card);
        return this._world.addChild(card);
    }
}