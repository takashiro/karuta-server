import {
	Method,
	Context,
	Connection,
	Driver,
} from '@karuta/core';

import Lobby from '../../src/base/Lobby';
import User from '../../src/base/User';
import Room from '../../src/base/Room';
import DriverLoader from '../../src/base/DriverLoader';

const lobby = new Lobby();
const u1 = new User(lobby);
const u2 = new User(lobby);
u1.setId(1);
const room = new Room(u1);

describe('User Management', () => {
	it('returns undefined if a user is not found', () => {
		const ret = room.findUser(111);
		expect(ret).toBeUndefined();
	});

	it('moves a user from another room', () => {
		u2.setId(2);
		const r2 = new Room(u2);
		expect(r2.getUsers()).toContain(u2);
		room.addUser(u2);
		expect(r2.getUsers()).toHaveLength(0);
		expect(room.findUser(2)).toBe(u2);
	});
});

describe('Notification Broadcasting', () => {
	it('broadcasts to all except one', () => {
		const u1Notify = jest.spyOn(u1, 'notify').mockReturnValue();
		const u2Notify = jest.spyOn(u2, 'notify').mockReturnValue();
		room.broadcastExcept(u2, Method.Post, Context.Message, 'test');
		expect(u1Notify).toBeCalledWith(Method.Post, Context.Message, 'test');
		expect(u2Notify).not.toBeCalled();
		u1Notify.mockRestore();
		u2Notify.mockRestore();
	});
});

describe('Configuration', () => {
	it('does nothing if invalid settings are to be patched', () => {
		room.updateConfig({});
	});
});

describe('Driver', () => {
	it('cannot load invalid drivers', () => {
		const loaded = room.loadDriver('jest');
		expect(loaded).toBe(false);
	});

	it('handles error from loading a driver', () => {
		const load = jest.spyOn(DriverLoader.prototype, 'load');
		const error = jest.spyOn(console, 'error').mockReturnValue();
		load.mockImplementation(() => {
			throw new Error('Invalid Driver');
		});
		const loaded = room.loadDriver('../../test/sample');
		expect(loaded).toBe(false);
		expect(error).toBeCalled();
		load.mockRestore();
		error.mockRestore();
	});

	it('silently ignores the request to unload a non-existing driver', () => {
		const success = room.unloadDriver();
		expect(success).toBe(false);
	});

	it('loads a driver', () => {
		const loaded = room.loadDriver('../../test/sample');
		expect(loaded).toBe(true);
	});

	it('shows driver profile', () => {
		const profile = room.getProfile();
		expect(profile.driver).toBeTruthy();
	});

	it('can handle drivers with 0 listener', () => {
		const driver = room.getDriver() as Driver<unknown>;
		const createContextListeners = jest.spyOn(driver, 'createContextListeners');
		createContextListeners.mockReturnValueOnce(undefined);
		const socket = {} as unknown as Connection;
		const u3 = new User(lobby, socket);
		room.addUser(u3);
		room.removeUser(u2);
	});
});
