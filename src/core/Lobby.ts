import {
	Lobby as AbstractLobby,
	Room,
	User,
} from '@karuta/core';

export default class Lobby implements AbstractLobby {
	protected users: Map<number, User>;

	protected nextUserId: number;

	protected rooms: Map<number, Room>;

	protected nextRoomId: number;

	/**
	 * Create a new instance of Server
	 */
	constructor() {
		this.users = new Map();
		this.nextUserId = 0;
		this.rooms = new Map();
		this.nextRoomId = 0;
	}

	/**
	 * Add a new room
	 * @param room
	 */
	addRoom(room: Room): void {
		this.nextRoomId++;
		Reflect.set(room, 'id', this.nextRoomId);
		this.rooms.set(room.getId(), room);

		room.once('close', () => this.removeRoom(room.getId()));
	}

	/**
	 * Find a room by room id
	 * @param id room id
	 */
	findRoom(id: number): Room | undefined {
		return this.rooms.get(id);
	}

	/**
	 * Remove a room by room id
	 * @param id room id
	 */
	removeRoom(id: number): void {
		this.rooms.delete(id);
	}

	/**
	 * @return all rooms
	 */
	getRooms(): Room[] {
		return Array.from(this.rooms.values());
	}

	/**
	 * Add a new connected user and assign user id
	 * @param user the user instance
	 */
	addUser(user: User): void {
		this.nextUserId++;
		Reflect.set(user, 'id', this.nextUserId);

		this.users.set(user.getId(), user);
		user.once('disconnected', () => this.removeUser(user.getId()));
	}

	/**
	 * Find a user by user id
	 * @param id user id
	 */
	findUser(id: number): User | undefined {
		return this.users.get(id);
	}

	/**
	 * Remove a user by user id
	 * @param id user id
	 */
	removeUser(id: number): void {
		this.users.delete(id);
	}

	/**
	 * Disconnect all users and close all rooms.
	 */
	async close(): Promise<void> {
		if (this.users.size <= 0) {
			return;
		}

		const users = Array.from(this.users.values());
		await Promise.all(users.map((user) => user.logout()));
	}
}
