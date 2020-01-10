import Action from '../net/Action';
import version from '../core/version';
import Command from '../net/Command';

interface Response {
	name: string;
	build: string;
}

export default class CheckVersion extends Action<void, Response> {
	constructor() {
		super(Command.CheckVersion);
	}

	async process(): Promise<Response> {
		return version;
	}
}
