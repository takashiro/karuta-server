import {
	Context,
	Method,
	User,
} from '@karuta/core';

import Action from '../core/Action';

export default class MessageHandler extends Action {
	constructor(user: User) {
		super(Context.Message, user);
	}

	post(message: unknown): void {
		if (typeof message !== 'string') {
			return;
		}

		const room = this.getRoom();
		if (!room) {
			return;
		}

		room.broadcast(Method.Post, Context.Message, {
			user: this.user.getId(),
			message,
		});
	}
}
