import {
	User,
	Room,
	Lobby,
} from '@karuta/core';
import { ContextListener } from '@karuta/protocol';

export default abstract class Action implements ContextListener {
	readonly context: number;

	protected readonly user: User;

	constructor(context: number, user: User) {
		this.context = context;
		this.user = user;
	}

	getUser(): User {
		return this.user;
	}

	getRoom(): Room | undefined {
		return this.user.getRoom();
	}

	getLobby(): Lobby {
		return this.user.getLobby();
	}
}
