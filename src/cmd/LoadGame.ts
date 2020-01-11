import Action from '../net/Action';
import Command from '../net/Command';
import User from '../core/User';

export default class LoadGame extends Action<string, string | null> {
	constructor() {
		super(Command.LoadGame);
	}

	async process(user: User, driver: string): Promise<string | null> {
		const room = user.getRoom();
		if (!room || room.getOwner() !== user) {
			return null;
		}

		const loaded = room.loadDriver(driver);
		return loaded ? driver : null;
	}
}
