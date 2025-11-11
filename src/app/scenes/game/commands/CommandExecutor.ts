import { CommandContext } from "./CommandContext";
import { Command, FunctionalCommand } from "./Command";
import type { GameScene } from "../GameScene";

export class CommandExecutor {
    private _context: CommandContext;

    constructor(scene: GameScene) {
        this._context = new CommandContext(this, scene);
    }

    async execute<RETURN_TYPE = void>(command: Command | FunctionalCommand<RETURN_TYPE>, ...args: any[]): Promise<RETURN_TYPE> {
        if (command instanceof Command) {
            return this._executeClassCommand(command, ...args);
        }
        else {
            return this._executeFunctionalCommand(command, ...args);
        }
    }

    private async _executeClassCommand<RETURN_TYPE = void>(command: Command, ...args: any[]): Promise<RETURN_TYPE> {
        return command.execute(...args);
    }

    private async _executeFunctionalCommand<RETURN_TYPE = void>(command: FunctionalCommand<RETURN_TYPE>, ...args: any[]): Promise<RETURN_TYPE> {
        const context = Object.assign(new CommandContext(this, this._context.scene), { context: this._context });

        return command.call(context, ...args);
    }
}