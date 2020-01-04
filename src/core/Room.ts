import * as EventEmitter from 'events';

import User from './User';
import Driver from './Driver';

export default class Room extends EventEmitter {
	id: number;
	owner: User;
	driver: Driver;
	users: Set<User>;

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
	 * Find a user by user id
	 * @param id user id
	 */
	findUser(id: number): User {
		for (const user of this.users) {
			if (user.id === id) {
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
	addUser(user: User) {
		if (user.room) {
			user.room.removeUser(user);
		}
		user.room = this;
		this.users.add(user);

		user.on('close', () => this.removeUser(user));
	}

	/**
	 * Remove a user from this room
	 * @param {User} user
	 */
	removeUser(user: User) {
		user.room = null;
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
	broadcast(command: number, args: any = null) {
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
	broadcastExcept(except: User, command: number, args: any = null) {
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
	getConfig() {
		const config = {
			id: this.id,
			owner: {
				id: this.owner.id,
			},
			driver: null,
		};

		if (this.driver && this.driver.getConfig) {
			config.driver = this.driver.getConfig();
			config.driver.name = this.driver.getName();
		}

		return config;
	}

	/**
	 * Setter of room configuration
	 * @param config
	 */
	updateConfig(config: object) {
		if (this.driver && this.driver.setConfig) {
			this.driver.setConfig(config);
		}
	}

	/**
	 * Load game extension
	 * @param {string} name driver name
	 * @return {boolean}
	 */
	loadExtension(name: string): boolean {
		try {
			const GameDriver = require(`../extension/${name}`);
			this.driver = new GameDriver(this);
			return true;
		} catch (error) {
			console.log(error.stack);
			return false;
		}
	}
}
