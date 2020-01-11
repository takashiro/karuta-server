import Action from '../net/Action';
import Command from '../net/Command';
import User from '../core/User';

export default class UpdateRoom extends Action<object, void> {
	constructor() {
		super(Command.UpdateRoom);
	}

	async process(user: User, config: object): Promise<void> {
		const room = user.getRoom();
		if (!room || room.getOwner() !== user) {
			return;
		}

		room.updateConfig(config);
		room.broadcast(Command.UpdateRoom, room.getConfig());
	}
}
