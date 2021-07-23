import path from 'path';
import WebSocket from 'ws';
import {
	Connection,
	Context,
} from '@karuta/core';

import Config from '../../src/core/Config';
import App from '../../src/core/App';

const port = 10000 + Math.floor(Math.random() * 55536);
const config = new Config();
config.setSocket({
	host: '127.0.0.1',
	port,
});
const app = new App(config);
const lobby = app.getLobby();

beforeAll(async () => {
	await app.start();
});

afterAll(async () => {
	await app.stop();
});

let user: Connection;
it('connects to the server', async () => {
	const ws = new WebSocket(`ws://127.0.0.1:${port}`);
	user = new Connection(ws);
	await user.open();
});

it('gets driver configuration', async () => {
	const config = await user.head(Context.Driver);
	expect(config).toBeUndefined();
});

it('cannot load a driver in the lobby', async () => {
	const succeeded = await user.put(Context.Driver, './test/sample');
	expect(succeeded).toBe(false);
});

let roomId = 0;
it('creates a room', async () => {
	roomId = await user.put(Context.Room) as number;
	expect(roomId).toBeGreaterThan(0);
});

it('gets driver configuration', async () => {
	const config = await user.head(Context.Driver);
	expect(config).toBeUndefined();
});

it('loads a driver', () => {
	const room = lobby.findRoom(roomId);
	const succeeded = room.loadDriver(path.join(__dirname, '..', 'sample'));
	expect(succeeded).toBe(true);
});

it('puts a custom context', async () => {
	const res = await user.put(1234);
	expect(res).toBe(true);
});

it('gets driver configuration', async () => {
	const config = await user.head(Context.Driver);
	expect(config).toStrictEqual({
		a: 2,
	});

	const profile = await user.get(Context.Driver);
	expect(profile).toStrictEqual({
		name: 'driver example',
		config,
	});
});

it('changes room configuration', async () => {
	await user.patch(Context.Driver, { a: 456 });
	const config = await user.head(Context.Driver);
	expect(config).toStrictEqual({
		a: 456,
	});
});
