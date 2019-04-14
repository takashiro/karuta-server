
const http = require('http');
const WebSocket = require('ws');

const defaultConfig = require('../config.default.json');

const Lobby = require('./Lobby');
const User = require('./User');
const CommonActions = require('./actions');

async function userListener(packet) {
	let action = null;
	if (packet.command < 0) {
		action = CommonActions.get(packet.command);
	} else if (packet.command > 0) {
		const driver = this.room && this.room.driver;
		const actions = driver && driver.actions;
		action = actions && actions.get(packet.command);
	}

	if (action) {
		const ret = await action.call(this, packet.arguments);
		if (ret !== undefined) {
			this.send(packet.command, ret);
		}
	} else {
		console.error('Undefined command: ' + packet.command);
	}
}

function lobbyListener(socket) {
	let user = new User(socket);
	user.on('action', userListener.bind(user));
	this.addUser(user);
}

class App {

	constructor(config) {
		this.config = Object.assign({}, defaultConfig, config);
		this.lobby = new Lobby;
		this.server = http.createServer();
		this.wss = new WebSocket.Server({server: this.server});
		this.wss.on('connection', lobbyListener.bind(this.lobby));
	}

	/**
	 * Start server to accept requests
	 * @return {Promise}
	 */
	start() {
		return new Promise((resolve, reject) => {
			this.server.listen(this.config.socket, resolve);
		});
	}

	/**
	 * Shutdown server
	 * @return {Promise}
	 */
	stop() {
		return new Promise((resolve) => {
			this.server.close(resolve);
		});
	}

}

module.exports = App;
