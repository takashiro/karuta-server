import Action from '../net/Action';
import User from '../core/User';
import Command from '../net/Command';

export default class LeaveRoom extends Action<void, void> {
	constructor() {
		super(Command.LeaveRoom);
	}

	async process(user: User): Promise<void> {
		const room = user.getRoom();
		if (room) {
			room.removeUser(user);
		}
	}
}
