import {
	Method,
	Context,
	User,
	Room,
	RoomConfiguration,
	RoomProfile,
} from '@karuta/core';

import GameRoom from '../base/Room';
import Action from '../base/Action';

interface QueryParams {
	id?: number;
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
		const room = new GameRoom(user);
		lobby.addRoom(room);

		return room.getId();
	}

	get(params: unknown): RoomProfile | undefined {
		const room = this.findRoom(params);
		return room?.getProfile();
	}

	post(params: unknown): RoomProfile | undefined {
		const room = this.findRoom(params);
		if (!room) {
			return;
		}

		const user = this.getUser();
		room.addUser(user);
		return room.getProfile();
	}

	head(): RoomConfiguration | undefined {
		const room = this.getRoom();
		return room?.getConfig();
	}

	patch(config: unknown): boolean {
		const room = this.getRoom();
		if (!room || room.getOwner() !== this.user) {
			return false;
		}

		if (typeof config !== 'object') {
			return false;
		}

		room.updateConfig(config as Partial<RoomConfiguration>);
		room.broadcast(Method.Patch, Context.Room, room.getConfig());
		return true;
	}

	private findRoom(params: unknown): Room | undefined {
		if (typeof params !== 'object' || !params) {
			return;
		}

		const lobby = this.getLobby();
		if (!lobby) {
			return;
		}

		const { id } = params as QueryParams;
		return id ? lobby.findRoom(id) : undefined;
	}
}
