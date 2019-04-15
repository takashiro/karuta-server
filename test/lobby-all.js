
const assert = require('assert');
const WebSocket = require('ws');

const App = require('../core/App');
const User = require('../core/User');
const cmd = require('../core/protocol');

const localhost = '127.0.0.1';

function waitUntilConnected(ws) {
	return new Promise(function (resolve, reject) {
		ws.once('open', resolve);
		ws.once('close', reject);
	});
}

describe('Lobby', () => {
	const port = 10000 + Math.floor(Math.random() * 55536);
	const app = new App({ socket: {port, host: localhost} });

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

	it('Client should be connected', () => {
		user = new User(ws);
		assert(user.connected);
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

	it('should stop the app', async () => {
		await app.stop();
	});
});
