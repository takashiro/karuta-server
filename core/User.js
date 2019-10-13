
const EventEmitter = require('events');
const WebSocket = require('ws');
const Packet = require('./Packet');

class User extends EventEmitter {
	/**
	 * Create a new instance of User
	 * @param {WebSocket} socket the web socket that connects to the client
	 */
	constructor(socket = null) {
		super();

		this.id = 0;
		this.lobby = null;
		this.room = null;
		this.setSocket(socket);
	}

	/**
	 * Gets the current room
	 * @return {Room}
	 */
	getRoom() {
		return this.room;
	}

	/**
	 * Sets the current room
	 * @param {Room} room
	 */
	setRoom(room) {
		this.room = room;
	}

	/**
	 * Gets the driver in the room
	 * @return {object}
	 */
	getDriver() {
		return this.room && this.room.driver;
	}

	/**
	 * @return {boolean} whether the user is connected
	 */
	get connected() {
		return this.socket && this.socket.readyState === WebSocket.OPEN;
	}

	/**
	 * @return {{id:number,name:string}} brief infomation
	 */
	get briefInfo() {
		return {
			id: this.id,
			nickname: this.nickname,
		};
	}

	/**
	 * Send a command to the client
	 * @param {number} command
	 * @param {object} args
	 * @return {boolean} true iff. the command was sent
	 */
	send(command, args = null) {
		if (!this.socket) {
			return false;
		}

		const packet = new Packet();
		packet.command = command;
		packet.arguments = args;

		try {
			this.socket.send(packet.toJSON());
		} catch (error) {
			// Write logs
		}
		return true;
	}

	/**
	 * Wait for a command
	 * @param {number} command
	 * @param {number} timeout
	 * @return {Promise} arguments of the command
	 */
	receive(command, timeout = 15000) {
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				this.unbind(command, resolve);
				reject();
			}, timeout);

			this.bindOnce(command, (args) => {
				clearTimeout(timer);
				resolve(args);
			});
		});
	}

	/**
	 * Send a command to the client and return the response
	 * @param {number} command
	 * @param {object} args
	 * @param {number} timeout
	 * @return {Promise<>} the promise that resolves user response
	 */
	request(command, args = null, timeout = 15000) {
		const reply = this.receive(command, timeout);
		this.send(command, args);
		return reply;
	}

	/**
	 * Disconnect the client
	 * @return {Promise}
	 */
	disconnect() {
		if (this.socket) {
			const closed = new Promise((resolve) => this.once('close', resolve));
			this.socket.close();
			this.socket = null;
			return closed;
		}
		return Promise.resolve();
	}

	/**
	 * Disconnect current socket and set a new one
	 * @param {WebSocket} socket
	 */
	setSocket(socket) {
		if (this.socket) {
			this.disconnect();
		}

		this.socket = socket;
		if (!socket) {
			return;
		}

		this.socket.on('message', (json) => {
			let packet = null;
			try {
				packet = Packet.parse(json);
			} catch (error) {
				console.error(error);
			}

			if (packet) {
				this.emit('action', packet);
				this.emit(`cmd-${packet.command}`, packet.arguments);
			}
		});

		this.socket.on('close', (code, reason) => {
			this.emit('close', code, reason);
		});

		this.socket.on('error', (error) => {
			this.emit('close', error.code, error.message);
		});
	}

	/**
	 * Bind a listener to a command
	 * @param {number} command
	 * @param {function} listener
	 */
	bind(command, listener) {
		this.on(`cmd-${command}`, listener);
	}

	/**
	 * Unbind a listener from a command
	 * @param {number} command
	 * @param {function} listener
	 */
	unbind(command, listener) {
		this.off(`cmd-${command}`, listener);
	}

	/**
	 * Bind a listener to a command for only once
	 * @param {number} command
	 * @param {function} listener
	 */
	bindOnce(command, listener) {
		this.once(`cmd-${command}`, listener);
	}
}

module.exports = User;
