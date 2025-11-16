import { animate, createTimeline } from "animejs";
import { getCommandContext } from "../../CommandExecutor";
import { NonNullableFields } from "../../../../../core/utils";
import { cancelled } from "redux-saga/effects";
import { CommandContext } from "../..";

export function* animateLiftDungeonDeck(height: number): Generator<any, void> {
    const timeline = createTimeline({ autoplay: false });
    const commandContext = yield* getCommandContext();
    const { world, model } = commandContext as NonNullableFields<CommandContext>;
    const roundModel = model.round!;

    try {
        for (let i = 0; i < roundModel.dungeonCards.length; i++) {
            const dungeonCardModel = roundModel.dungeonCards[i];
            const dungeonCard = world.cards.find(predicateCard => predicateCard.model === dungeonCardModel)!;
            const dungeonCardZ = world.layout.getDungeonDeckCardPosition(i).z + height;

            timeline.add(
                dungeonCard.position3D,
                {
                    z: dungeonCardZ,
                    duration: 200,
                    onUpdate: () => dungeonCard.updatePerspective(world.camera)
                },
                0
            );
        }

        yield timeline.play().then();
    }
    finally {
        if (yield cancelled()) {
            timeline.cancel();
        }
    }
}