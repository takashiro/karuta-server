
const assert = require('assert');
const WebSocket = require('ws');

const App = require('../core/App');
const User = require('../core/User');
const cmd = require('../cmd');

const localhost = '127.0.0.1';

function waitUntilConnected(ws) {
	return new Promise(function (resolve, reject) {
		ws.once('open', resolve);
		ws.once('close', reject);
	});
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
			a: this.a
		};
	}

}

describe('Lobby', () => {
	const port = 10000 + Math.floor(Math.random() * 55536);
	const app = new App({ socket: {port, host: localhost} });
	const lobby = app.lobby;

	it('should be listening ' + port, async () => {
		await app.start();
	});

	const serverUrl = `ws://${localhost}:${port}`;

	let ws = null;
	let user = null;
	it('should connect to ' + serverUrl, () => {
		ws = new WebSocket(serverUrl);
		waitUntilConnected(ws);
	});

	it('Client should be connected', async () => {
		user = new User(ws);
		assert(user.connected);
		user.id = await user.request(cmd.Login);
		assert(user.id > 0);
	});

	it('Client checks server version', async () => {
		const version = await user.request(cmd.CheckVersion);
		const serverVersion = require('../core/version.json');
		assert.deepEqual(version, serverVersion);
	});

	let roomId = 0;
	it('creates a room', async () => {
		roomId = await user.request(cmd.CreateRoom);
		assert(roomId > 0);
	});

	it('should have a new room', () => {
		assert(app.lobby.rooms.size === 1);
		assert(app.lobby.rooms.has(roomId));
	});

	let user2 = null;
	it('comes another user', async () => {
		const ws = new WebSocket(serverUrl);
		await waitUntilConnected(ws);

		user2 = new User(ws);
		user2.id = await user.request(cmd.Login);

		const ret = await user2.request(cmd.EnterRoom, roomId);
		assert(ret === roomId);
	});

	it('unicast a command', async () => {
		const text = 'This is a test: ' + Math.floor(Math.random() * 65536);

		const reply = user.receive(cmd.Speak);
		const room = lobby.findRoom(roomId);
		const serverUser = room.findUser(user.id);
		serverUser.send(cmd.Speak, text);
		const message = await reply;
		assert(message === text);
	});

	const key = [2, 3, 9, 7];
	it('broadcasts a command', async () => {
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

	it('updates room configuration', async () => {
		const received = user2.receive(cmd.UpdateRoom);
		user.send(cmd.UpdateRoom, {a: Math.floor(Math.random() * 0xFFFF)});
		const room = await received;
		assert(room.id === roomId);
		assert(room.owner && room.owner.id === user.id);
		assert(room.driver === null);
	});

	it('updates game driver configuration', async () => {
		const room = lobby.findRoom(roomId);
		room.driver = new GameDriver;

		const salt = Math.floor(Math.random() * 0xFFFF);
		const received = user2.receive(cmd.UpdateRoom);
		user.send(cmd.UpdateRoom, {a: salt});
		const config = await received;
		assert(config.driver);
		assert(config.driver.a === salt);
	});

	it('should stop the app', async () => {
		await app.stop();
	});
});
