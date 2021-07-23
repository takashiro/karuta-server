import {
	Context,
	DriverProfile,
	Method,
	User,
} from '@karuta/core';

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

	get(): DriverProfile<unknown> | undefined {
		const room = this.getRoom();
		if (!room) {
			return;
		}
		const driver = room.getDriver();
		return driver?.getProfile();
	}

	head(): unknown | undefined {
		const room = this.getRoom();
		if (!room) {
			return;
		}
		const driver = room.getDriver();
		return driver?.getConfig();
	}

	patch(params: unknown): boolean {
		const room = this.getRoom();
		if (!room) {
			return false;
		}
		const driver = room.getDriver();
		if (!driver) {
			return false;
		}
		driver.updateConfig(params);
		room.broadcast(Method.Patch, Context.Driver, driver.getConfig());
		return true;
	}
}
