import http from 'http';
import WebSocket from 'ws';

import { Connection } from '@karuta/core';

import Lobby from './Lobby';
import User from './User';
import Config from './Config';

import ContextListeners from '../cmd';

export default class App {
	config: Config;

	lobby: Lobby;

	server: http.Server;

	wss: WebSocket.Server;

	constructor(config: Config) {
		this.config = config;
		this.lobby = new Lobby();
		this.server = http.createServer();
		this.wss = new WebSocket.Server({ server: this.server });
		this.wss.on('connection', (socket) => this.createUser(socket));
	}

	/**
	 * Start server to accept requests
	 */
	start(): Promise<void> {
		return new Promise((resolve) => {
			this.server.listen(this.config.getSocket(), resolve);
		});
	}

	createUser(socket: WebSocket): void {
		const conn = new Connection(socket);
		const user = new User(this.lobby, conn);
		socket.addEventListener('close', () => user.disconnect());
		this.lobby.addUser(user);

		for (const ContextListener of ContextListeners) {
			const listener = new ContextListener(user);
			conn.on(listener);
		}
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
