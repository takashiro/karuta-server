import { EventEmitter } from 'events';
import WebSocket from 'ws';

import {
	Lobby,
	Room,
	Driver,
	User as AbstractUser,
	UserProfile,
	Connection,
	Method,
} from '@karuta/core';

interface User {
	on(event: 'disconnected', listener: () => void): this;

	once(event: 'disconnected', listener: () => void): this;

	off(event: 'disconnected', listener: () => void): this;

	emit(event: 'disconnected'): boolean;
}

class User extends EventEmitter implements AbstractUser {
	protected id = 0;

	protected name?: string;

	protected lobby: Lobby;

	protected room?: Room;

	protected socket?: Connection;

	/**
	 * Create a new instance of User
	 * @param socket the web socket that connects to the client
	 */
	constructor(lobby: Lobby, socket?: Connection) {
		super();
		this.lobby = lobby;
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
	getRoom(): Room | undefined {
		return this.room;
	}

	/**
	 * Sets the current room
	 * @param room
	 */
	setRoom(room?: Room): void {
		this.room = room;
	}

	/**
	 * Gets game lobby
	 */
	getLobby(): Lobby {
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
	getDriver(): Driver | undefined {
		return this.room?.getDriver();
	}

	/**
	 * @return whether the user is connected
	 */
	isConnected(): boolean {
		return Boolean(this.socket && this.socket.getReadyState() === WebSocket.OPEN);
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
	 * Log out.
	 */
	async logout(): Promise<void> {
		const { socket } = this;
		if (!socket) {
			return;
		}
		delete this.socket;
		await socket.close();
	}

	/**
	 * Fire a disconnected event.
	 */
	disconnect(): void {
		this.emit('disconnected');
	}

	/**
	 * Disconnect current socket and set a new one
	 * @param socket
	 */
	setSocket(socket?: Connection): void {
		if (this.socket) {
			this.socket.close();
		}
		this.socket = socket;
	}

	setRequestTimeout(timeout?: number): void {
		this.socket?.setRequestTimeout(timeout);
	}

	getRequestTimeout(): number | undefined {
		return this.socket?.getRequestTimeout();
	}

	async get(context: number, params?: unknown): Promise<unknown> {
		return this.socket?.get(context, params);
	}

	async head(context: number, params?: unknown): Promise<unknown> {
		return this.socket?.head(context, params);
	}

	async post(context: number, params?: unknown): Promise<unknown> {
		return this.socket?.post(context, params);
	}

	async put(context: number, params?: unknown): Promise<unknown> {
		return this.socket?.put(context, params);
	}

	async patch(context: number, params?: unknown): Promise<unknown> {
		return this.socket?.patch(context, params);
	}

	async delete(context: number, params?: unknown): Promise<unknown> {
		return this.socket?.delete(context, params);
	}

	async request(method: Method, context: number, params?: unknown): Promise<unknown> {
		return this.socket?.request(method, context, params);
	}

	notify(method: Method, context: number, params?: unknown): void {
		this.socket?.notify(method, context, params);
	}
}

export default User;
