import User from '../core/User';
import Action from '../net/Action';
import Command from '../net/Command';

export default class EnterRoom extends Action<number, number> {
	constructor() {
		super(Command.EnterRoom);
	}

	async process(user: User, id: number): Promise<number> {
		const lobby = user.getLobby();
		if (!lobby) {
			return -1;
		}

		const room = lobby.findRoom(id);
		if (room) {
			room.addUser(user);
			return room.id;
		}
		return -1;
	}
}
