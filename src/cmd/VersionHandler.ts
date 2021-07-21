import {
	Context,
	User,
} from '@karuta/core';

import Action from '../core/Action';
import { pkg } from '../core/Package';

export default class VersionHandler extends Action {
	constructor(user: User) {
		super(Context.Version, user);
	}

	get(): Promise<unknown> {
		return pkg.readVersion();
	}
}
