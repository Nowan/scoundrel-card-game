import { cancelled } from "redux-saga/effects";
import { NonNullableFields } from "../../../../../core/utils";
import { CommandContext } from "../../CommandContext";
import { getCommandContext } from "../../CommandExecutor";
import { DraggedCardsStack } from "../DraggedCardsStack";
import { createTimeline, spring } from "animejs";

export function* animateReturnDraggedCardsToRoomPositions(draggedCardsStack: DraggedCardsStack): Generator<any> {
    const timeline = createTimeline({ autoplay: false });

    try {
        const commandContext = yield* getCommandContext();
        const { world, model } = commandContext as NonNullableFields<CommandContext>;

        for (let i = 0; i < draggedCardsStack.cards.length; i++) {
            const card = draggedCardsStack.cards[i];
            const cardOrdinal = model.round!.roomCards.findIndex(roomCardModel => card.model === roomCardModel);
            const cardTargetPosition = world.layout.slots.roomCards[cardOrdinal].position3D;

            timeline.add(
                card.position3D,
                {
                    ...cardTargetPosition,
                    onUpdate: () => card.updatePerspective(world.camera),
                    ease: spring({ stiffness: 200, damping: 20 })
                },
                0
            );

        }

        draggedCardsStack.pauseSprings();
        yield timeline.play().then();
    }
    finally {
        if (yield cancelled()) {
            timeline.cancel();
        }
    }
}