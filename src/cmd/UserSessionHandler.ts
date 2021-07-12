import { Context } from '@karuta/protocol';
import { User } from '@karuta/core';

import Action from '../core/Action';

export default class UserSessionHandler extends Action {
	constructor(user: User) {
		super(Context.UserSession, user);
	}

	post(credential: unknown): unknown {
		if (typeof credential === 'object') {
			const { name } = credential as Record<string, string>;
			this.user.setName(name);
		}
		return this.user.getId();
	}

	delete(): void {
		this.user.logout();
	}
}
