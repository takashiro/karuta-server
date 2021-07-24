import { Room, User } from '@karuta/core';
import DriverHandler from '../../src/cmd/DriverHandler';

const user = {} as unknown as User;
const getOwner = jest.fn().mockReturnValue(user);
const loadDriver = jest.fn();
const getDriver = jest.fn();
const room = {
	getOwner,
	getDriver,
	loadDriver,
} as unknown as Room;
const handler = new DriverHandler(user);
const getRoom = jest.spyOn(handler, 'getRoom').mockReturnValue(room);

it('does nothing if the user is in the lobby', () => {
	getRoom.mockReturnValueOnce(undefined);
	expect(handler.put('test')).toBe(false);
});

it('returns nothing if the user is in the lobby', () => {
	getRoom.mockReturnValueOnce(undefined);
	expect(handler.get()).toBeUndefined();
});

it('cannot patch configuration in the lobby', () => {
	getRoom.mockReturnValueOnce(undefined);
	expect(handler.patch(123)).toBe(false);
});

it('returns nothing if driver is not loaded', () => {
	expect(handler.get()).toBeUndefined();
});

it('cannot patch configuration if driver is not loaded', () => {
	expect(handler.patch(234)).toBe(false);
});

it('does nothing if the user does not own the room', () => {
	getOwner.mockReturnValueOnce(undefined);
	expect(handler.put('test')).toBe(false);
});

it('cannot unload the driver if the user does not own the room', () => {
	getOwner.mockReturnValueOnce(undefined);
	expect(handler.delete()).toBe(false);
});

it('accepts string only', () => {
	expect(handler.put({ a: 1 })).toBe(false);
});

it('rejects invalid module name', () => {
	expect(handler.put('/root/.ssh/')).toBe(false);
	expect(handler.put('~/.ssh/')).toBe(false);
});

it('loads driver', () => {
	const drivers = [
		'@karuta/sample-driver',
		'test-driver',
	];
	for (const driver of drivers) {
		handler.put(driver);
		expect(loadDriver).toBeCalledWith(driver);
		loadDriver.mockClear();
	}
});
