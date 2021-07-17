import WebSocket from 'ws';

import {
	Method,
	Context,
	Connection,
} from '@karuta/protocol';

import App from '../src/core/App';
import serverVersion from '../src/core/version';
import Config from '../src/core/Config';

interface RoomProfile {
	id: number;
	owner: {
		id: number;
	};
	driver?: unknown;
}

const localhost = '127.0.0.1';

function waitUntilConnected(socket: WebSocket): Promise<void> {
	return new Promise(((resolve, reject) => {
		socket.once('open', resolve);
		socket.once('close', reject);
	}));
}

describe('Lobby', () => {
	const port = 10000 + Math.floor(Math.random() * 55536);
	const config = new Config();
	config.setSocket({
		host: localhost,
		port,
	});
	const app = new App(config);
	const { lobby } = app;

	test(`should be listening ${port}`, async () => {
		await app.start();
	});

	const serverUrl = `ws://${localhost}:${port}`;
	let ws: WebSocket;
	let user1: Connection;
	let user1Id: number;
	let user2: Connection;
	let user2Id: number;

	test(`should connect to ${serverUrl}`, async () => {
		ws = new WebSocket(serverUrl);
		await waitUntilConnected(ws);
	});

	test('Client should be connected', async () => {
		user1 = new Connection(ws);
		expect(user1.getReadyState()).toBe(WebSocket.OPEN);
		user1Id = await user1.post(Context.UserSession) as number;
		expect(user1Id).toBeGreaterThan(0);
	});

	test('Client checks server version', async () => {
		const version = await user1.get(Context.Version);
		expect(version).toStrictEqual(serverVersion);
	});

	let roomId: number;
	test('creates a room', async () => {
		roomId = await user1.put(Context.Room) as number;
		expect(roomId).toBeGreaterThan(0);
	});

	test('should have a new room', () => {
		const rooms = app.lobby.getRooms();
		expect(rooms.length).toBe(1);
		expect(app.lobby.findRoom(roomId)).toBeTruthy();
	});

	test('comes another user', async () => {
		const socket = new WebSocket(serverUrl);
		await waitUntilConnected(socket);

		user2 = new Connection(socket);
		user2Id = await user1.post(Context.UserSession) as number;
		expect(user2Id).toBeGreaterThan(0);

		const ret = await user2.get(Context.Room, { id: roomId });
		expect(ret).toBe(roomId);
	});

	test('unicast a command', async () => {
		const text = `This is a test: ${Math.floor(Math.random() * 65536)}`;

		const reply = new Promise((resolve) => {
			user1.on({
				context: Context.Message,
				post: resolve,
			});
		});
		const room = lobby.findRoom(roomId);
		const serverUser = room.findUser(user1Id);
		serverUser.notify(Method.Post, Context.Message, text);
		const message = await reply;
		expect(message).toBe(text);
	});

	const key = [2, 3, 9, 7];
	test('broadcasts a command', async () => {
		const reply1 = new Promise((resolve) => {
			user1.on({
				context: Context.Users,
				put: resolve,
			});
		});
		const reply2 = new Promise((resolve) => {
			user2.on({
				context: Context.Users,
				put: resolve,
			});
		});

		const room = lobby.findRoom(roomId);
		expect(room).toBeTruthy();

		room.broadcast(Method.Put, Context.Users, key);

		const users1 = await reply1;
		const users2 = await reply2;
		expect(users1).toEqual(key);
		expect(users2).toEqual(key);
	});

	test('updates room configuration', async () => {
		const received = new Promise((resolve) => {
			user2.on({
				context: Context.Room,
				patch: resolve,
			});
		});
		user1.notify(Method.Patch, Context.Room, { a: Math.floor(Math.random() * 0xFFFF) });
		const room = await received as RoomProfile;
		expect(room.id).toBe(roomId);
		expect(room.owner.id).toBe(user1Id);
		expect(room.driver).toBeUndefined();
	});

	test('should stop the app', async () => {
		await app.stop();
	});
});
