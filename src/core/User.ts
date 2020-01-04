import * as EventEmitter from 'events';
import * as WebSocket from 'ws';

import Packet from './Packet';
import Lobby from './Lobby';
import Room from './Room';

type Action = (args: any) => void;

export default class User extends EventEmitter {
	id: number;
	lobby: Lobby;
	room: Room;
	socket: WebSocket;
	nickname: string;

	/**
	 * Create a new instance of User
	 * @param {WebSocket} socket the web socket that connects to the client
	 */
	constructor(socket: WebSocket = null) {
		super();

		this.id = 0;
		this.lobby = null;
		this.room = null;
		this.setSocket(socket);
	}

	/**
	 * Gets the current room
	 */
	getRoom(): Room {
		return this.room;
	}

	/**
	 * Sets the current room
	 * @param room
	 */
	setRoom(room: Room) {
		this.room = room;
	}

	/**
	 * Gets the driver in the room
	 */
	getDriver(): object {
		return this.room && this.room.driver;
	}

	/**
	 * @return whether the user is connected
	 */
	get connected(): boolean {
		return this.socket && this.socket.readyState === WebSocket.OPEN;
	}

	/**
	 * @return brief infomation
	 */
	get briefInfo(): { id: number; nickname: string; } {
		return {
			id: this.id,
			nickname: this.nickname,
		};
	}

	/**
	 * Send a command to the client
	 * @param command
	 * @param args
	 * @return true iff. the command was sent
	 */
	send(command: number, args: object = null): boolean {
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
	 * @param command
	 * @param timeout
	 * @return arguments of the command
	 */
	receive(command: number, timeout: number = 15000): Promise<any> {
		return new Promise((resolve, reject) => {
			let timer = null;

			const resolver = (args) => {
				clearTimeout(timer);
				resolve(args);
			};

			timer = setTimeout(() => {
				this.unbind(command, resolver);
				reject();
			}, timeout);

			this.bindOnce(command, resolver);
		});
	}

	/**
	 * Send a command to the client and return the response
	 * @param command
	 * @param args
	 * @param timeout
	 * @return the promise that resolves user response
	 */
	request(command: number, args: object = null, timeout: number = 15000): Promise<any> {
		const reply = this.receive(command, timeout);
		this.send(command, args);
		return reply;
	}

	/**
	 * Disconnect the client
	 */
	async disconnect(): Promise<void> {
		if (this.socket) {
			const closed = new Promise((resolve) => this.once('close', resolve));
			this.socket.close();
			this.socket = null;
			await closed;
		}
	}

	/**
	 * Disconnect current socket and set a new one
	 * @param {WebSocket} socket
	 */
	setSocket(socket: WebSocket) {
		if (this.socket) {
			this.disconnect();
		}

		this.socket = socket;
		if (!socket) {
			return;
		}

		this.socket.on('message', (json: string) => {
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

		this.socket.on('error', (error: NodeJS.ErrnoException) => {
			this.emit('close', error.code, error.message);
		});
	}

	/**
	 * Bind a listener to a command
	 * @param command
	 * @param listener
	 */
	bind(command: number, listener: Action) {
		this.on(`cmd-${command}`, listener);
	}

	/**
	 * Unbind a listener from a command
	 * @param command
	 * @param listener
	 */
	unbind(command: number, listener: Action) {
		this.off(`cmd-${command}`, listener);
	}

	/**
	 * Bind a listener to a command for only once
	 * @param command
	 * @param listener
	 */
	bindOnce(command: number, listener: Action) {
		this.once(`cmd-${command}`, listener);
	}
}
