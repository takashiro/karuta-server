import fs from 'fs';
import WebSocket from 'ws';

import {
	Method,
	Context,
	Connection,
} from '@karuta/core';

import App from '../../src/core/App';
import Config from '../../src/core/Config';
import idle from '../../src/util/idle';

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

const port = 10000 + Math.floor(Math.random() * 55536);
const config = new Config();
config.setSocket({
	host: localhost,
	port,
});
const app = new App(config);
const lobby = app.getLobby();

it(`should be listening ${port}`, async () => {
	await app.start();
});

const serverUrl = `ws://${localhost}:${port}`;
let ws: WebSocket;
let user1: Connection;
let user1Id: number;
let user2: Connection;
let user2Id: number;

it(`should connect to ${serverUrl}`, async () => {
	ws = new WebSocket(serverUrl);
	await waitUntilConnected(ws);
});

it('should be connected', async () => {
	user1 = new Connection(ws);
	expect(user1.getReadyState()).toBe(WebSocket.OPEN);
	user1Id = await user1.post(Context.UserSession) as number;
	expect(user1Id).toBeGreaterThan(0);
});

it('checks server version', async () => {
	const version = await user1.get(Context.Version);
	const pkg = JSON.parse(await fs.promises.readFile(`${__dirname}/../../package.json`, 'utf-8'));
	expect(version).toStrictEqual(pkg.version);
});

let roomId: number;
it('creates a room', async () => {
	roomId = await user1.put(Context.Room) as number;
	expect(roomId).toBeGreaterThan(0);
});

it('should have a new room', () => {
	const rooms = lobby.getRooms();
	expect(rooms.length).toBe(1);
	expect(lobby.findRoom(roomId)).toBeTruthy();
});

it('comes another user', async () => {
	const socket = new WebSocket(serverUrl);
	await waitUntilConnected(socket);

	user2 = new Connection(socket);
	user2Id = await user2.post(Context.UserSession) as number;
	expect(user2Id).toBeGreaterThan(0);

	const ret = await user2.get(Context.Room, { id: roomId });
	expect(ret).toBe(roomId);
});

it('unicast a command', async () => {
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
it('broadcasts a command', async () => {
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

it('updates room configuration', async () => {
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

it('cannot modify room configuration without owner privilege', async () => {
	const room = lobby.findRoom(roomId);
	const updateConfig = jest.spyOn(room, 'updateConfig');
	await user2.patch(Context.Room, { a: 1 });
	expect(updateConfig).not.toBeCalled();
	updateConfig.mockRestore();
});

it('speaks', async () => {
	const received = new Promise((resolve) => {
		user1.on({
			context: Context.Message,
			post: resolve,
		});
	});
	await user2.post(Context.Message, 'Hello, there!');
	const msg = await received;
	expect(msg).toStrictEqual({
		user: user2Id,
		message: 'Hello, there!',
	});
});

it('logs out', async () => {
	expect(lobby.findUser(user2Id)).toBeTruthy();
	await user2.delete(Context.UserSession);
	await idle(0);
	await user2.close();
	expect(lobby.findUser(user2Id)).toBeFalsy();
});

it('should stop the app', async () => {
	await app.stop();
});
