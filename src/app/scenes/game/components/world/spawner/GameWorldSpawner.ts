import { PointData3D } from "../../../../../core/utils";
import { CardRank, CardSuit } from "../../../models";
import { PerspectiveCard } from "../../card";
import GameWorld from "../GameWorld";

export class GameWorldSpawner {
    private readonly _world: GameWorld;

    constructor(world: GameWorld) {
        this._world = world;
    }

    public spawnCard(rank: CardRank, suit: CardSuit, position3D: PointData3D = this._world.layout.slots.cardSpawn.position3D): PerspectiveCard {
        const card = new PerspectiveCard(rank, suit);
        card.position3D = { ...position3D };
        card.updatePerspective(this._world.camera);
        return this._world.addChild(card);
    }
}