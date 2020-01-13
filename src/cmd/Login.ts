import Action from '../net/Action';
import Command from '../net/Command';
import User from '../core/User';

interface Credential {
	name: string;
}

export default class Login extends Action<Credential, number> {
	constructor() {
		super(Command.Login);
	}

	async process(user: User, credential: Credential): Promise<number> {
		// TO-DO
		if (credential) {
			user.setName(credential.name);
		}
		return user.getId();
	}
}
