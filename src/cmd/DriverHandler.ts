import { Context } from '@karuta/protocol';
import { User } from '@karuta/core';

import Action from '../core/Action';

export default class DriverHandler extends Action {
	constructor(user: User) {
		super(Context.Driver, user);
	}

	put(driver: unknown): boolean {
		const room = this.getRoom();
		if (!room || room.getOwner() !== this.user) {
			return false;
		}

		if (typeof driver !== 'string') {
			return false;
		}

		if (!driver.match(/^(@[\w-]+\/)?[\w-]+$/)) {
			return false;
		}

		return room.loadDriver(driver);
	}
}
