import {
	Context,
	User,
} from '@karuta/core';

import Action from '../base/Action';
import { pkg } from '../base/Package';

export default class VersionHandler extends Action {
	constructor(user: User) {
		super(Context.Version, user);
	}

	get(): Promise<unknown> {
		return pkg.readVersion();
	}
}
