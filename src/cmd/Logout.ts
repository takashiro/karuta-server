import Action from '../net/Action';
import Command from '../net/Command';
import User from '../core/User';

export default class Logout extends Action<void, void> {
	constructor() {
		super(Command.Logout);
	}

	async process(user: User): Promise<void> {
		user.disconnect();
	}
}
