import { CommandContext } from "./CommandContext";
import { Command as ClassCommand, FunctionalCommand } from "./Command";
import type { GameScene } from "../GameScene";
import { runSaga } from "redux-saga";
import { getContext } from "redux-saga/effects";

export class CommandExecutor {
    private _context: CommandContext;

    constructor(scene: GameScene) {
        this._context = new CommandContext(this, scene);

        this.execute = this.execute.bind(this);
    }

    execute<RETURN_TYPE = void>(command: ClassCommand | FunctionalCommand<RETURN_TYPE>, ...args: any[]): Promise<RETURN_TYPE> {
        if (command instanceof ClassCommand) {
            return this._executeClassCommand(command, ...args);
        }
        else {
            return this._executeFunctionalCommand(command, ...args);
        }
    }

    async _executeClassCommand<RETURN_TYPE = void>(command: ClassCommand, ...args: any[]): Promise<RETURN_TYPE> {
        return runSaga(
            { context: { command: this._context } },
            command.execute,
            ...args
        ).toPromise();
    }

    async _executeFunctionalCommand<RETURN_TYPE = void>(command: FunctionalCommand<RETURN_TYPE>, ...args: any[]): Promise<RETURN_TYPE> {
        const context = Object.assign(new CommandContext(this, this._context.scene), { context: this._context });

        return runSaga(
            { context: { command: this._context } },
            command.bind(context),
            ...args
        ).toPromise();
    }
}

/**
 * @example
 * const context = yield* getCommandContext();
 */
export function* getCommandContext(): Generator<ReturnType<typeof getContext>, CommandContext, CommandContext> {
    return yield getContext("command");
}