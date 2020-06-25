import { EventEmitter } from 'events';

import {
	Driver,
	Room as RoomInterface,
} from '@karuta/core';
import User from './User';
import DriverLoader from './DriverLoader';

export default class Room extends EventEmitter implements RoomInterface {
	protected id: number;

	protected owner: User;

	protected driver: Driver | null;

	protected users: Set<User>;

	/**
	 * Create a new instance of Room
	 * @param owner the room owner
	 */
	constructor(owner: User) {
		super();

		this.id = 0;
		this.owner = owner;
		this.driver = null;

		this.users = new Set();
		this.addUser(owner);
	}

	/**
	 * Gets room id
	 */
	getId(): number {
		return this.id;
	}

	/**
	 * Sets room id
	 * @param id
	 */
	setId(id: number): void {
		this.id = id;
	}

	/**
	 * @return The driver loaded in this room
	 */
	getDriver(): Driver | null {
		return this.driver;
	}

	/**
	 * @return Room owner
	 */
	getOwner(): User {
		return this.owner;
	}

	/**
	 * Find a user by user id
	 * @param id user id
	 */
	findUser(id: number): User | null {
		for (const user of this.users) {
			if (user.getId() === id) {
				return user;
			}
		}
		return null;
	}

	/**
	 * Gets user list
	 */
	getUsers(): User[] {
		return Array.from(this.users);
	}

	/**
	 * Add a user into this room
	 * @param user
	 */
	addUser(user: User): void {
		const room = user.getRoom();
		if (room) {
			room.removeUser(user);
		}
		user.setRoom(this);
		this.users.add(user);

		user.on('close', () => this.removeUser(user));
	}

	/**
	 * Remove a user from this room
	 * @param user
	 */
	removeUser(user: User): void {
		user.setRoom(null);
		this.users.delete(user);

		if (this.users.size <= 0) {
			this.emit('close');
		}
	}

	/**
	 * Broadcast a command to all users in this room
	 * @param command
	 * @param args
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	broadcast(command: number, args: any = null): void {
		for (const user of this.users) {
			user.send(command, args);
		}
	}

	/**
	 * Broadcast a command to all users except one
	 * @param except
	 * @param command
	 * @param args
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	broadcastExcept(except: User, command: number, args: any = null): void {
		for (const user of this.users) {
			if (user === except) {
				continue;
			}
			user.send(command, args);
		}
	}

	/**
	 * Getter of room configuration
	 */
	getConfig(): object {
		return {
			id: this.id,
			owner: {
				id: this.owner.getId(),
			},
			driver: this.driver && this.driver.getConfig ? {
				...this.driver.getConfig(),
				name: this.driver.getName(),
			} : null,
		};
	}

	/**
	 * Update room configuration
	 * @param config
	 */
	updateConfig(config: object): void {
		if (this.driver && this.driver.setConfig) {
			this.driver.setConfig(config);
		}
	}

	/**
	 * Load a driver from ./extension/.
	 * @param name driver name
	 */
	loadDriver(name: string): boolean {
		const loader = new DriverLoader(name);
		if (!loader.isValid()) {
			return false;
		}

		try {
			const GameDriver = loader.load();
			this.driver = new GameDriver(this);
			return true;
		} catch (error) {
			console.log(error.stack);
			return false;
		}
	}
}
