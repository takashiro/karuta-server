import Action from '../net/Action';

import Room from '../core/Room';
import User from '../core/User';
import Command from '../net/Command';

export default class CreateRoom extends Action<void, number> {
	constructor() {
		super(Command.CreateRoom);
	}

	async process(user: User): Promise<number> {
		const { lobby } = user;
		if (!lobby) {
			return 0;
		}

		const room = new Room(user);
		lobby.addRoom(room);

		return room.id;
	}
}
