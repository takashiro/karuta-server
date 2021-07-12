import {
	Method,
	Context,
} from '@karuta/protocol';

import { User } from '@karuta/core';

import Room from '../core/Room';
import Action from '../core/Action';

interface GetParams {
	id: number;
}

export default class RoomHandler extends Action {
	constructor(user: User) {
		super(Context.Room, user);
	}

	put(): number {
		const lobby = this.getLobby();
		if (!lobby) {
			return 0;
		}

		const user = this.getUser();
		const room = new Room(user);
		lobby.addRoom(room);

		return room.getId();
	}

	get(params: unknown): number {
		if (typeof params !== 'object' || !params) {
			return -1;
		}

		const lobby = this.getLobby();
		if (!lobby) {
			return -1;
		}

		const { id } = params as GetParams;
		const room = lobby.findRoom(id);
		if (room) {
			const user = this.getUser();
			room.addUser(user);
			return room.getId();
		}
		return -1;
	}

	patch(config: unknown): void {
		const room = this.user.getRoom();
		if (!room || room.getOwner() !== this.user) {
			return;
		}

		room.updateConfig(config);
		room.broadcast(Method.Patch, Context.Room, room.getConfig());
	}
}
