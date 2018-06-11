
const EventEmitter = require('events');
const Packet = require('./Packet');
const net = require('./protocol');

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
	 * @param {object} arguments
	 * @return {boolean} true iff. the command was sent
	 */
	send(command, args = null) {
		if (!this.socket) {
			return false;
		}

		let packet = new Packet;
		packet.command = command;
		if (args) {
			packet.arguments = args;
		}

		this.socket.send(packet.toJSON());
		return true;
	}

	/**
	 * Send a notification to the client
	 * @param {number} command
	 * @param {object} args
	 */
	notify(command, args) {
		this.send(net.Notify, {
			cmd: command,
			arg: args,
		});
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
