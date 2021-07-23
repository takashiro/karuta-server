import {
	Room,
	User,
} from '@karuta/core';

import UserHandler from '../../src/cmd/UserHandler';

const user = {
} as unknown as User;

const findUser = jest.fn();
const room = {
	findUser,
} as unknown as Room;

const handler = new UserHandler(user);
const getRoom = jest.spyOn(handler, 'getRoom');

it('rejects invalid parameters', () => {
	expect(handler.head('12')).toBeUndefined();
	expect(handler.head({ id: '1' })).toBeUndefined();
});

it('returns nothing in the lobby', () => {
	getRoom.mockReturnValueOnce(undefined);
	expect(handler.head({ id: 1 })).toBe(undefined);
});

it('tries to find a user in the room', () => {
	getRoom.mockReturnValue(room);
	expect(handler.head({ id: 1 })).toBe(undefined);
	expect(findUser).toBeCalledWith(1);
});
