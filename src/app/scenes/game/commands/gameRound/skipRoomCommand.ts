import { call, cancelled } from "redux-saga/effects";
import { FunctionalCommand } from "../Command";
import { discardRoomCardsCommand } from "../card";

export const skipRoomCommand: FunctionalCommand = (
    function* skipRoomCommand() {
        try {
            const roomCards = this.model.round?.roomCards ?? [];

            yield call(discardRoomCardsCommand.bind(this, ...roomCards))
        }
        finally {
            if (yield cancelled()) {
                // Cleanup logic
            }
        }
    }
);