import User from './User';
import Room from './Room';

export default class Lobby {
	users: Map<number, User>;

	nextUserId: number;

	rooms: Map<number, Room>;

	nextRoomId: number;

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
		room.id = this.nextRoomId;
		this.rooms.set(room.id, room);

		room.once('close', () => this.removeRoom(room.id));
	}

	/**
	 * Find a room by room id
	 * @param id room id
	 */
	findRoom(id: number): Room {
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
	 * Add a new connected user and assign user id
	 * @param user the user instance
	 */
	addUser(user: User): void {
		this.nextUserId++;
		user.id = this.nextUserId;
		user.lobby = this;

		this.users.set(user.id, user);
		user.on('close', () => this.removeUser(user.id));
	}

	/**
	 * Find a user by user id
	 * @param id user id
	 */
	findUser(id: number): User {
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
		await Promise.all(users.map((user) => user.disconnect()));
	}
}
