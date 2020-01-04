const assert = require('assert');
const WebSocket = require('ws');

const App = require('../core/App');
const User = require('../core/User');
const cmd = require('../cmd');

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

	setConfig(config) {
		this.a = config.a;
	}

	getConfig() {
		return {
			a: this.a,
		};
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
		assert(user.connected);
		user.id = await user.request(cmd.Login);
		assert(user.id > 0);
	});

	test('Client checks server version', async () => {
		const version = await user.request(cmd.CheckVersion);
		const serverVersion = require('../core/version.json');
		assert.deepEqual(version, serverVersion);
	});

	let roomId = 0;
	test('creates a room', async () => {
		roomId = await user.request(cmd.CreateRoom);
		assert(roomId > 0);
	});

	test('should have a new room', () => {
		assert(app.lobby.rooms.size === 1);
		assert(app.lobby.rooms.has(roomId));
	});

	let user2 = null;
	test('comes another user', async () => {
		const socket = new WebSocket(serverUrl);
		await waitUntilConnected(socket);

		user2 = new User(socket);
		user2.id = await user.request(cmd.Login);

		const ret = await user2.request(cmd.EnterRoom, roomId);
		assert(ret === roomId);
	});

	test('unicast a command', async () => {
		const text = `This is a test: ${Math.floor(Math.random() * 65536)}`;

		const reply = user.receive(cmd.Speak);
		const room = lobby.findRoom(roomId);
		const serverUser = room.findUser(user.id);
		serverUser.send(cmd.Speak, text);
		const message = await reply;
		assert(message === text);
	});

	const key = [2, 3, 9, 7];
	test('broadcasts a command', async () => {
		const reply1 = user.receive(cmd.SetUserList);
		const reply2 = user2.receive(cmd.SetUserList);

		const room = lobby.findRoom(roomId);
		assert(room);

		room.broadcast(cmd.SetUserList, key);

		const users1 = await reply1;
		const users2 = await reply2;
		assert.deepStrictEqual(users1, key);
		assert.deepStrictEqual(users2, key);
	});

	test('updates room configuration', async () => {
		const received = user2.receive(cmd.UpdateRoom);
		user.send(cmd.UpdateRoom, { a: Math.floor(Math.random() * 0xFFFF) });
		const room = await received;
		assert(room.id === roomId);
		assert(room.owner && room.owner.id === user.id);
		assert(room.driver === null);
	});

	test('updates game driver configuration', async () => {
		const room = lobby.findRoom(roomId);
		room.driver = new GameDriver();

		const salt = Math.floor(Math.random() * 0xFFFF);
		const received = user2.receive(cmd.UpdateRoom);
		user.send(cmd.UpdateRoom, { a: salt });
		const config = await received;
		assert(config.driver);
		assert(config.driver.a === salt);
	});

	test('should stop the app', async () => {
		await app.stop();
	});
});
