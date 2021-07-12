import { Context } from '@karuta/protocol';
import { User } from '@karuta/core';

import Action from '../core/Action';
import version from '../core/version';

export default class VersionHandler extends Action {
	constructor(user: User) {
		super(Context.Version, user);
	}

	get(): unknown {
		if (this.user.isConnected()) {
			return version;
		}
		return '';
	}
}
