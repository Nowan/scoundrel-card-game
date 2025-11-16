import { call, cancelled } from "redux-saga/effects";
import { FunctionalCommand } from "../Command";
import { discardRoomCardsCommand, scoopRoomCardsCommand } from "../card";

export const avoidRoomCommand: FunctionalCommand = (
    function* avoidRoomCommand() {
        try {
            const roomCards = this.model.round?.roomCards ?? [];
            yield call(scoopRoomCardsCommand.bind(this, ...roomCards));

            // yield call(discardRoomCardsCommand.bind(this, ...roomCards))
        }
        finally {
            if (yield cancelled()) {
                // Cleanup logic
            }
        }
    }
);