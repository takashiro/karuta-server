import { EventEmitter } from 'events';
import WebSocket from 'ws';

import {
	Room,
	Driver,
	User as UserInterface,
	UserProfile,
} from '@karuta/core';

import Packet from './Packet';
import Lobby from './Lobby';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Action = (args: any) => void;

export default class User extends EventEmitter implements UserInterface {
	protected id: number;

	protected name: string | undefined;

	protected lobby: Lobby | null;

	protected room: Room | null;

	protected socket: WebSocket | null;

	/**
	 * Create a new instance of User
	 * @param socket the web socket that connects to the client
	 */
	constructor(socket: WebSocket | null = null) {
		super();

		this.id = 0;
		this.room = null;
		this.lobby = null;
		this.socket = null;

		this.setSocket(socket);
	}

	getId(): number {
		return this.id;
	}

	setId(id: number): void {
		this.id = id;
	}

	getName(): string | undefined {
		return this.name;
	}

	setName(name: string): void {
		this.name = name;
	}

	/**
	 * Gets the current room
	 */
	getRoom(): Room | null {
		return this.room;
	}

	/**
	 * Sets the current room
	 * @param room
	 */
	setRoom(room: Room | null): void {
		this.room = room;
	}

	/**
	 * Gets game lobby
	 */
	getLobby(): Lobby | null {
		return this.lobby;
	}

	/**
	 * Sets game lobby
	 * @param lobby
	 */
	setLobby(lobby: Lobby): void {
		this.lobby = lobby;
	}

	/**
	 * Gets the driver in the room
	 */
	getDriver(): Driver | null {
		return this.room && this.room.getDriver();
	}

	/**
	 * @return whether the user is connected
	 */
	isConnected(): boolean {
		return Boolean(this.socket && this.socket.readyState === WebSocket.OPEN);
	}

	/**
	 * @return brief infomation
	 */
	getProfile(): UserProfile {
		return {
			id: this.id,
			name: this.name,
		};
	}

	/**
	 * Send a command to the client
	 * @param command
	 * @param args
	 * @return true iff. the command was sent
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	send(command: number, args: any = null): boolean {
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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	receive(command: number, timeout = 15000): Promise<any> {
		return new Promise((resolve, reject) => {
			let timer: NodeJS.Timeout | null = null;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const resolver: (args: any) => void = (args: any) => {
				resolve(args);

				if (timer) {
					clearTimeout(timer);
				}
			};
			this.bindOnce(command, resolver);

			timer = setTimeout(() => {
				this.unbind(command, resolver);
				reject();
			}, timeout);
		});
	}

	/**
	 * Send a command to the client and return the response
	 * @param command
	 * @param args
	 * @param timeout
	 * @return the promise that resolves user response
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	request(command: number, args: any = null, timeout = 15000): Promise<any> {
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
	 * @param socket
	 */
	setSocket(socket: WebSocket | null): void {
		if (this.socket) {
			this.disconnect();
		}

		this.socket = socket;
		if (!this.socket) {
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
	bind(command: number, listener: Action): void {
		this.on(`cmd-${command}`, listener);
	}

	/**
	 * Unbind a listener from a command
	 * @param command
	 * @param listener
	 */
	unbind(command: number, listener: Action): void {
		this.off(`cmd-${command}`, listener);
	}

	/**
	 * Bind a listener to a command for only once
	 * @param command
	 * @param listener
	 */
	bindOnce(command: number, listener: Action): void {
		this.once(`cmd-${command}`, listener);
	}
}
