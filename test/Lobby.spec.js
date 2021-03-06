import WebSocket from 'ws';

import App from '../src/core/App';
import User from '../src/core/User';

import cmd from '../src/net/Command';
import serverVersion from '../src/core/version';

const localhost = '127.0.0.1';

function waitUntilConnected(socket) {
	return new Promise(((resolve, reject) => {
		socket.once('open', resolve);
		socket.once('close', reject);
	}));
}

class GameDriver {
	constructor() {
		this.name = 'test driver';
	}

	getName() {
		return this.name;
	}

	setConfig(config) {
		this.a = config.a;
	}

	getConfig() {
		return {
			a: this.a,
		};
	}

	getAction(command) {
		this.a = String(command);
		return null;
	}
}

describe('Lobby', () => {
	const port = 10000 + Math.floor(Math.random() * 55536);
	const app = new App({ socket: { port, host: localhost } });
	const { lobby } = app;

	test(`should be listening ${port}`, async () => {
		await app.start();
	});

	const serverUrl = `ws://${localhost}:${port}`;

	let ws = null;
	let user = null;
	test(`should connect to ${serverUrl}`, async () => {
		ws = new WebSocket(serverUrl);
		await waitUntilConnected(ws);
	});

	test('Client should be connected', async () => {
		user = new User(ws);
		expect(user.isConnected()).toBeTruthy();
		user.id = await user.request(cmd.Login);
		expect(user.id).toBeGreaterThan(0);
	});

	test('Client checks server version', async () => {
		const version = await user.request(cmd.CheckVersion);
		expect(version).toEqual(serverVersion);
	});

	let roomId = 0;
	test('creates a room', async () => {
		roomId = await user.request(cmd.CreateRoom);
		expect(roomId).toBeGreaterThan(0);
	});

	test('should have a new room', () => {
		const rooms = app.lobby.getRooms();
		expect(rooms.length).toBe(1);
		expect(app.lobby.findRoom(roomId)).toBeTruthy();
	});

	let user2 = null;
	test('comes another user', async () => {
		const socket = new WebSocket(serverUrl);
		await waitUntilConnected(socket);

		user2 = new User(socket);
		user2.setId(await user.request(cmd.Login));

		const ret = await user2.request(cmd.EnterRoom, roomId);
		expect(ret).toBe(roomId);
	});

	test('unicast a command', async () => {
		const text = `This is a test: ${Math.floor(Math.random() * 65536)}`;

		const reply = user.receive(cmd.Speak);
		const room = lobby.findRoom(roomId);
		const serverUser = room.findUser(user.getId());
		serverUser.send(cmd.Speak, text);
		const message = await reply;
		expect(message).toBe(text);
	});

	const key = [2, 3, 9, 7];
	test('broadcasts a command', async () => {
		const reply1 = user.receive(cmd.SetUserList);
		const reply2 = user2.receive(cmd.SetUserList);

		const room = lobby.findRoom(roomId);
		expect(room).toBeTruthy();

		room.broadcast(cmd.SetUserList, key);

		const users1 = await reply1;
		const users2 = await reply2;
		expect(users1).toEqual(key);
		expect(users2).toEqual(key);
	});

	test('updates room configuration', async () => {
		const received = user2.receive(cmd.UpdateRoom);
		user.send(cmd.UpdateRoom, { a: Math.floor(Math.random() * 0xFFFF) });
		const room = await received;
		expect(room.id).toBe(roomId);
		expect(room.owner.id).toBe(user.getId());
		expect(room.driver).toBeNull();
	});

	test('updates game driver configuration', async () => {
		const room = lobby.findRoom(roomId);
		room.driver = new GameDriver();

		const salt = Math.floor(Math.random() * 0xFFFF);
		const received = user2.receive(cmd.UpdateRoom);
		user.send(cmd.UpdateRoom, { a: salt });
		const config = await received;
		expect(config.driver).toBeTruthy();
		expect(config.driver.a).toBe(salt);
	});

	test('should stop the app', async () => {
		await app.stop();
	});
});
