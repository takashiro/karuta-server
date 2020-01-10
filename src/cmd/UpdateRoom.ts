import Action from '../net/Action';
import Command from '../net/Command';
import User from '../core/User';

export default class UpdateRoom extends Action<object, void> {
	constructor() {
		super(Command.UpdateRoom);
	}

	async process(user: User, config: object): Promise<void> {
		const { room } = user;
		if (!room || room.owner !== user) {
			return;
		}

		room.updateConfig(config);
		room.broadcast(Command.UpdateRoom, room.getConfig());
	}
}
