import { all, call, cancelled } from "redux-saga/effects";
import { DraggedCardsStack } from "../DraggedCardsStack";
import { animateLiftDungeonDeck } from "./animateLiftDungeonDeck";
import { getCommandContext } from "../../CommandExecutor";
import { NonNullableFields } from "../../../../../core/utils";
import { CommandContext } from "../../CommandContext";
import { createTimeline } from "animejs";

export function* animateRetrieveDraggedCardsStack(draggedCardsStack: DraggedCardsStack) {
    yield all([
        call(animateLiftDungeonDeck, 0),
        call(animateMoveCardsToDraggedStack, draggedCardsStack)
    ])
}

function* animateMoveCardsToDraggedStack(draggedCardsStack: DraggedCardsStack): Generator<any> {
    const timeline = createTimeline({ autoplay: false });

    try {
        const cards = draggedCardsStack.cards;
        const commandContext = yield* getCommandContext();
        const { world } = commandContext as NonNullableFields<CommandContext>;

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];

            timeline.add(
                card.rotation3D,
                {
                    y: 0,
                    duration: 200
                },
                0
            );
        }

        draggedCardsStack.resumeSprings();

        timeline.onUpdate = () => cards.forEach(card => card.updatePerspective(world.camera));

        yield timeline.play().then();
    }
    finally {
        if (yield cancelled()) {
            timeline.cancel();
        }
    }
}