
import * as http from 'http';
import * as WebSocket from 'ws';

import { CommandMap as actions } from '../cmd';
import Lobby from './Lobby';
import User from './User';
import Config from './Config';

import * as defaultConfig from '../../config.default.json';

async function userListener(packet) {
	let action = null;
	if (packet.command < 0) {
		action = actions.get(packet.command);
	} else if (packet.command > 0) {
		const driver = this.getDriver();
		if (driver && driver.getAction) {
			try {
				action = driver.getAction(packet.command);
			} catch (error) {
				console.error(`Failed to get driver action: ${error}`);
			}
		}
	}

	if (action) {
		const ret = await action.call(this, packet.arguments);
		if (ret !== undefined) {
			this.send(packet.command, ret);
		}
	} else {
		// This should be a reply.
	}
}

function lobbyListener(socket) {
	const user = new User(socket);
	user.on('action', userListener.bind(user));
	this.addUser(user);
}

export default class App {
	config: Config;
	lobby: Lobby;
	server: http.Server;
	wss: WebSocket.Server;

	constructor(config) {
		this.config = { ...defaultConfig, ...config };
		this.lobby = new Lobby();
		this.server = http.createServer();
		this.wss = new WebSocket.Server({ server: this.server });
		this.wss.on('connection', lobbyListener.bind(this.lobby));
	}

	/**
	 * Start server to accept requests
	 * @return {Promise}
	 */
	start() {
		return new Promise((resolve) => {
			this.server.listen(this.config.socket, resolve);
		});
	}

	/**
	 * Shutdown server
	 * @return {Promise}
	 */
	async stop() {
		await this.lobby.close();

		await new Promise((resolve, reject) => {
			this.server.close((err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
}
