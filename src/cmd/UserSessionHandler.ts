import {
	Context,
	User,
} from '@karuta/core';

import Action from '../base/Action';

export default class UserSessionHandler extends Action {
	constructor(user: User) {
		super(Context.UserSession, user);
	}

	post(credential: unknown): number {
		if (typeof credential === 'object') {
			const { name } = credential as Record<string, string>;
			this.user.setName(name);
		}
		return this.user.getId();
	}

	delete(): void {
		setTimeout((): void => {
			this.user.logout();
		}, 0);
	}
}
