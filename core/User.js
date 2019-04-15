
const EventEmitter = require('events');
const Packet = require('./Packet');
const WebSocket = require('ws');

class User extends EventEmitter {

	/**
	 * Create a new instance of User
	 * @param {WebSocket} socket the web socket that connects to the client
	 */
	constructor(socket = null) {
		super();

		this.id = 0;
		this.lobby = null;
		this.setSocket(socket);
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
			let timer = setTimeout(reject, timeout);
			this.once('cmd-' + command, args => {
				clearTimeout(timer);
				resolve(args);
			});
		});

		this.send(command, args);
		return reply;
	}

	/**
	 * Disconnect the client
	 * @return {Promise}
	 */
	disconnect() {
		if (this.socket) {
			let closed = new Promise(resolve => this.once('close', resolve));
			this.socket.close();
			this.socket = null;
			return closed;
		} else {
			return Promise.resolve();
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
		if (!socket) {
			return;
		}

		this.socket.on('message', json => {
			let packet = null;
			try {
				packet = Packet.parse(json);
			} catch (error) {
				console.error(error);
			}

			if (packet) {
				this.emit('action', packet);
				this.emit('cmd-' + packet.command, packet.arguments);
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

module.exports = User;
