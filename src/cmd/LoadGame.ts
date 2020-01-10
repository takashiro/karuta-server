import Action from '../net/Action';
import Command from '../net/Command';
import User from '../core/User';

export default class LoadGame extends Action<string, string | null> {
	constructor() {
		super(Command.LoadGame);
	}

	async process(user: User, driver: string): Promise<string | null> {
		const { room } = user;
		if (!room || room.owner !== user) {
			return null;
		}

		const loaded = room.loadExtension(driver);
		return loaded ? driver : null;
	}
}
