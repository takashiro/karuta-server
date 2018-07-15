
const EventEmitter = require('events');
const Packet = require('./Packet');

class User extends EventEmitter {

	/**
	 * Create a new instance of User
	 * @param {WebSocket} socket the web socket that connects to the client
	 */
	constructor(socket = null) {
		super();

		this.id = 0;
		this.server = null;
		this.setSocket(socket);

		this.onmessage = new Map;
	}

	/**
	 * @return {boolean} whether the user is connected
	 */
	get connected() {
		return this.socket && this.socket.readyState == WebSocket.OPEN;
	}

	/**
	 * @return {{id:number,name:string}} brief infomation
	 */
	get briefInfo() {
		return {
			id: this.id,
			nickname: this.nickname
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

		let packet = new Packet;
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
	 * Send a command to the client and return the response
	 * @param {number} command
	 * @param {object} args
	 * @param {number} timeout
	 * @return {Promise<>} the promise that resolves user response
	 */
	request(command, args = null, timeout = 15000) {
		let reply = new Promise((resolve, reject) => {
			this.bind(command, resolve);
			setTimeout(reject, timeout);
		});

		this.send(command, args);
		return reply;
	}

	/**
	 * Bind a callback to a network command
	 * @param {number} command
	 * @param {Function} callback
	 * @param {object} options
	 */
	bind(command, callback, options = null) {
		if (options && options.once) {
			callback.once = true;
		}

		let callbacks = this.onmessage.get(command);
		if (!callbacks) {
			callbacks = new Set;
			this.onmessage.set(command, callbacks);
		}

		callbacks.add(callback);
	}

	/**
	 * Unbind a callback from a network command
	 * @param {number} command
	 * @param {Function} callback if it's null, all callback will be cleared
	 */
	unbind(command, callback = null) {
		if (!callback) {
			this.onmessage.delete(command);
		} else {
			let callbacks = this.onmessage.get(command);
			if (callbacks) {
				callbacks.delete(callback);
			}
		}
	}

	/**
	 * Trigger callbacks of a network command
	 * @param {number} command
	 * @param {object} args
	 */
	trigger(command, args) {
		let callbacks = this.onmessage.get(command);
		if (callbacks) {
			let removed = [];
			for (let callback of callbacks) {
				callback.call(this, args);
				if (callback.once) {
					removed.push(callback);
				}
			}
			for (let callback of removed) {
				callbacks.delete(callback);
			}
		}
	}

	/**
	 * Disconnect the client
	 */
	disconnect() {
		if (this.socket) {
			this.socket.close();
			this.socket = null;
		}
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
		if (socket) {
			this.socket.on('message', json => {
				let packet = new Packet;
				if (packet.parse(json)) {
					this.emit('action', packet);
					this.trigger(packet.command, packet.arguments);
				}
			});

			this.socket.on('close', (code, reason) => {
				this.emit('close', code, reason);
			});

			this.socket.on('error', error => {
				this.emit('close', error.code, error.message);
			});
		}
	}
}

module.exports = User;
