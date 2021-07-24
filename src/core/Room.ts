import { EventEmitter } from 'events';

import {
	Driver,
	Room as AbstractRoom,
	User,
	Method,
	Connection,
	RoomConfiguration,
	RoomProfile,
} from '@karuta/core';

import DriverLoader from './DriverLoader';

export default class Room extends EventEmitter implements AbstractRoom {
	protected id = 0;

	protected owner: User;

	protected config: RoomConfiguration = {};

	protected driver?: Driver<unknown>;

	protected users: Set<User> = new Set();

	/**
	 * Create a new instance of Room
	 * @param owner the room owner
	 */
	constructor(owner: User) {
		super();

		this.owner = owner;
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
	getDriver(): Driver<unknown> | undefined {
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
		this.bindEvents(user);

		user.once('disconnected', () => this.removeUser(user));
	}

	/**
	 * Remove a user from this room
	 * @param user
	 */
	removeUser(user: User): void {
		user.setRoom();
		this.users.delete(user);
		this.unbindEvents(user);

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
	 * @return Basic information of the room
	 */
	getProfile(): RoomProfile {
		return {
			id: this.id,
			owner: {
				id: this.owner.getId(),
			},
			driver: this.driver?.getName(),
			config: this.getConfig(),
		};
	}

	/**
	 * @return Driver configurations
	 */
	getConfig(): RoomConfiguration {
		return this.config;
	}

	/**
	 * Update room configuration
	 * @param config
	 */
	updateConfig(config: RoomConfiguration): void {
		if (config.name) {
			this.config.name = config.name;
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
		} catch (error) {
			console.error(error);
			return false;
		}

		for (const user of this.users) {
			this.bindEvents(user);
		}

		return true;
	}

	/**
	 * Unload the existing driver.
	 * @return Whether the driver is unloaded.
	 */
	unloadDriver(): boolean {
		if (!this.driver) {
			return false;
		}

		for (const user of this.users) {
			this.unbindEvents(user);
		}

		delete this.driver;

		return true;
	}

	protected bindEvents(user: User): void {
		if (!this.driver) {
			return;
		}

		const socket = Reflect.get(user, 'socket') as Connection;
		if (!socket) {
			return;
		}

		const listeners = this.driver.createContextListeners(user);
		if (!listeners) {
			return;
		}

		for (const listener of listeners) {
			socket.on(listener);
		}
	}

	protected unbindEvents(user: User): void {
		if (!this.driver) {
			return;
		}

		const socket = Reflect.get(user, 'socket') as Connection;
		if (!socket) {
			return;
		}

		const listeners = socket.getListeners();
		for (const listener of listeners) {
			if (listener.context < 0) {
				continue;
			}
			socket.off(listener.context);
		}
	}
}
