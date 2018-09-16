
const EventEmitter = require('events');

class Room extends EventEmitter {

	/**
	 * Create a new instance of Room
	 * @param {User} owner the room owner
	 */
	constructor(owner) {
		super();

		this.id = 0;
		this.owner = owner;
		this.driver = null;

		this.users = new Set;
		this.addUser(owner);
	}

	/**
	 * Find a user by user id
	 * @param {number} id user id
	 */
	findUser(id) {
		for (let user of this.users) {
			if (user.id === id) {
				return user;
			}
		}
		return null;
	}

	/**
	 * Add a user into this room
	 * @param {User} user
	 */
	addUser(user) {
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
	removeUser(user) {
		user.room = null;
		this.users.delete(user);

		if (this.closeTimeout) {
			clearTimeout(this.closeTimeout);
		}
		this.closeTimeout = setTimeout(() => {
			if (this.users.size <= 0) {
				this.emit('close');
			}
		}, 10 * 60 * 1000);
	}

	/**
	 * Broadcast a command to all users in this room
	 * @param {number} command
	 * @param {object} args
	 */
	broadcast(command, args = null) {
		for (let user of this.users) {
			user.send(command, args);
		}
	}

	/**
	 * Broadcast a command to all users except one
	 * @param {User} except
	 * @param {number} command
	 * @param {object} args
	 */
	broadcastExcept(except, command, args = null) {
		for (let user of this.users) {
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
		let config = {
			id: this.id,
			owner: {
				id: this.owner.id
			},
			driver: null
		};

		if (this.driver && this.driver.getConfig) {
			config.driver = this.driver.getConfig();
			config.driver.name = this.driver.name;
		}
	}

	/**
	 * Setter of room configuration
	 * @param {*} config
	 */
	updateConfig(config) {
		if (this.driver && this.driver.setConfig) {
			this.driver.setConfig(config);
		}
	}

	/**
	 * Load game extension
	 * @param {string} name driver name
	 * @return {boolean}
	 */
	loadExtension(name) {
		try {
			const GameDriver = require('../extension/' + name);
			this.driver = new GameDriver(this);
			return true;
		} catch (error) {
			console.log(error.stack);
			return false;
		}
	}

}

module.exports = Room;
