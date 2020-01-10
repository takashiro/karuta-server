import Command from './Command';
import User from '../core/User';

abstract class Action<Request, Response> {
	command: Command;

	constructor(command: Command) {
		this.command = command;
	}

	getCommand(): Command {
		return this.command;
	}

	abstract process(user: User, req: Request): Promise<Response>;
}

export default Action;
