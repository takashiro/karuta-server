import http from 'http';
import WebSocket from 'ws';

import Action from '../net/Action';

import Lobby from './Lobby';
import User from './User';
import Packet from './Packet';
import Config from './Config';

import defaultConfig from '../defaultConfig';
import actions from '../cmd';

async function handleUserAction(user: User, packet: Packet): Promise<void> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let action: Action<any, any> | undefined;
	if (packet.command < 0) {
		action = actions.get(packet.command);
	} else if (packet.command > 0) {
		const driver = user.getDriver();
		if (driver) {
			try {
				action = driver.getAction(packet.command);
			} catch (error) {
				console.error(`Failed to get driver action: ${error}`);
			}
		}
	}

	if (action) {
		const ret = await action.process(user, packet.arguments);
		if (ret !== undefined) {
			user.send(packet.command, ret);
		}
	} else {
		// This should be a reply.
	}
}

function handleNewConnection(lobby: Lobby, socket: WebSocket): void {
	const user = new User(socket);
	user.on('action', (packet) => handleUserAction(user, packet));
	lobby.addUser(user);
}

export default class App {
	config: Config;

	lobby: Lobby;

	server: http.Server;

	wss: WebSocket.Server;

	constructor(config: Config) {
		this.config = { ...defaultConfig, ...config };
		this.lobby = new Lobby();
		this.server = http.createServer();
		this.wss = new WebSocket.Server({ server: this.server });
		this.wss.on('connection', (socket) => handleNewConnection(this.lobby, socket));
	}

	/**
	 * Start server to accept requests
	 */
	start(): Promise<void> {
		return new Promise((resolve) => {
			this.server.listen(this.config.socket, resolve);
		});
	}

	/**
	 * Shutdown server
	 */
	async stop(): Promise<void> {
		await this.lobby.close();

		await new Promise<void>((resolve, reject) => {
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
