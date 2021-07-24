import {
	Connection,
	Lobby,
	Room,
} from '@karuta/core';

import User from '../../src/base/User';

const lobby = {
} as unknown as Lobby;

const getDriver = jest.fn();
const room = {
	getDriver,
} as unknown as Room;

const getReadyState = jest.fn();
const close = jest.fn();
const get = jest.fn();
const post = jest.fn();
const head = jest.fn();
const patch = jest.fn();
const put = jest.fn();
const del = jest.fn();
const request = jest.fn();
const notify = jest.fn();
const getRequestTimeout = jest.fn();
const setRequestTimeout = jest.fn();
const socket = {
	getReadyState,
	close,
	request,
	notify,
	get,
	post,
	head,
	patch,
	put,
	delete: del,
	getRequestTimeout,
	setRequestTimeout,
} as unknown as Connection;

const user = new User(lobby, socket);

it('has id', () => {
	user.setId(777);
	expect(user.getId()).toBe(777);
});

it('has name', () => {
	expect(user.getName()).toBeUndefined();
	user.setName('takashiro');
	expect(user.getName()).toBe('takashiro');
});

it('has connection state', () => {
	expect(user.isConnected()).toBe(false);
	getReadyState.mockReturnValueOnce(1);
	expect(user.isConnected()).toBe(true);
});

it('has no driver by default', () => {
	expect(user.getDriver()).toBeUndefined();
});

it('gets driver from the room', () => {
	user.setRoom(room);
	expect(user.getDriver()).toBeUndefined();
	expect(getDriver).toBeCalled();
});

it('closes the previous socket if a new one is set', () => {
	user.setSocket();
	expect(close).toBeCalled();
	close.mockClear();
});

it('does not send anything if disconnected', () => {
	user.notify(1, 2, 3);
	user.put(1);
	user.patch(2);
	user.get(3);
	user.post(4);
	user.delete(5);
	user.head(6);
	user.request(7, 8, 9);
	expect(notify).not.toBeCalled();

	user.setRequestTimeout(100);
	expect(user.getRequestTimeout()).toBeUndefined();
});

it('does not logout again', () => {
	user.logout();
	expect(close).not.toBeCalled();
	user.setSocket(socket);
});

it('can get something', async () => {
	await user.get(1, 9);
	expect(get).toBeCalledWith(1, 9);
});

it('can post something', async () => {
	await user.post(2, 'as');
	expect(post).toBeCalledWith(2, 'as');
});

it('can head something', async () => {
	await user.head(3, true);
	expect(head).toBeCalledWith(3, true);
});

it('can patch something', async () => {
	await user.patch(4, { a: 1 });
	expect(patch).toBeCalledWith(4, { a: 1 });
});

it('can delete something', async () => {
	await user.delete(5, '');
	expect(del).toBeCalledWith(5, '');
});

it('can put something', async () => {
	await user.put(6, false);
	expect(put).toBeCalledWith(6, false);
});

it('can request something', async () => {
	await user.request(7, 8, 9);
	expect(request).toBeCalledWith(7, 8, 9);
});

it('can configure request timeout', () => {
	user.setRequestTimeout(123);
	expect(setRequestTimeout).toBeCalledWith(123);
	getRequestTimeout.mockReturnValue(456);
	expect(user.getRequestTimeout()).toBe(456);
});
