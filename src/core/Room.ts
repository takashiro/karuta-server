import { EventEmitter } from 'events';

import { Method } from '@karuta/protocol';

import {
	Driver,
	Room as AbstractRoom,
	User,
} from '@karuta/core';

import DriverLoader from './DriverLoader';

export default class Room extends EventEmitter implements AbstractRoom {
	protected id: number;

	protected owner: User;

	protected driver?: Driver;

	protected users: Set<User>;

	/**
	 * Create a new instance of Room
	 * @param owner the room owner
	 */
	constructor(owner: User) {
		super();

		this.id = 0;
		this.owner = owner;

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
	 * @return The driver loaded in this room
	 */
	getDriver(): Driver | undefined {
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
	findUser(id: number): User | undefined {
		for (const user of this.users) {
			if (user.getId() === id) {
				return user;
			}
		}
		return undefined;
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

		user.once('disconnected', () => this.removeUser(user));
	}

	/**
	 * Remove a user from this room
	 * @param user
	 */
	removeUser(user: User): void {
		user.setRoom();
		this.users.delete(user);

		if (this.users.size <= 0) {
			this.emit('close');
		}
	}

	/**
	 * Broadcast a command to all users in this room
	 * @param method
	 * @param context
	 * @param args
	 */
	broadcast(method: Method, context: number, args?: unknown): void {
		for (const user of this.users) {
			user.notify(method, context, args);
		}
	}

	/**
	 * Broadcast a command to all users except one
	 * @param except
	 * @param method
	 * @param context
	 * @param args
	 */
	broadcastExcept(except: User, method: Method, context: number, args?: unknown): void {
		for (const user of this.users) {
			if (user === except) {
				continue;
			}
			user.notify(method, context, args);
		}
	}

	/**
	 * Getter of room configuration
	 */
	getConfig(): unknown {
		return {
			id: this.id,
			owner: {
				id: this.owner.getId(),
			},
			driver: this.driver && this.driver.getConfig ? {
				...this.driver.getConfig() as Record<string, unknown>,
				name: this.driver.getName(),
			} : undefined,
		};
	}

	/**
	 * Update room configuration
	 * @param config
	 */
	updateConfig(config: unknown): void {
		if (this.driver && this.driver.setConfig) {
			this.driver.setConfig(config);
		}
	}

	/**
	 * Load a driver from Node.js modules.
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
