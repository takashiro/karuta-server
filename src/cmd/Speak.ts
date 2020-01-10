import Action from '../net/Action';
import Command from '../net/Command';
import User from '../core/User';

export default class Speak extends Action<string, void> {
	constructor() {
		super(Command.Speak);
	}

	async process(user: User, message: string): Promise<void> {
		const { room } = user;
		if (!room) {
			return;
		}

		room.broadcast(Command.Speak, {
			user: user.id,
			message,
		});
	}
}
