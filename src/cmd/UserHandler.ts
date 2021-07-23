import {
	Context,
	User,
	UserProfile,
} from '@karuta/core';

import Action from '../core/Action';

interface QueryParams {
	id: number;
}

export default class UserHandler extends Action {
	constructor(user: User) {
		super(Context.User, user);
	}

	head(params: unknown): UserProfile | undefined {
		if (typeof params !== 'object') {
			return;
		}

		const { id } = params as QueryParams;
		if (!Number.isInteger(id)) {
			return;
		}

		const room = this.getRoom();
		if (!room) {
			return;
		}

		const user = room.findUser(id);
		return user?.getProfile();
	}
}
