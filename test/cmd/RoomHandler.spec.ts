import {
	Room,
	User,
} from '@karuta/core';

import RoomHandler from '../../src/cmd/RoomHandler';

const getOwner = jest.fn();
const room = {
	getOwner,
} as unknown as Room;
const user = {} as unknown as User;
const handler = new RoomHandler(user);
const getRoom = jest.spyOn(handler, 'getRoom').mockReturnValue(room);
getOwner.mockReturnValue(user);

it('shows no configuration in the lobby', () => {
	getRoom.mockReturnValueOnce(undefined);
	expect(handler.head()).toBe(undefined);
});

it('returns nothing the request is invalid', () => {
	const res = handler.get(123);
	expect(res).toBe(undefined);
});

it('ignores invalid configuration on updating', () => {
	const res = handler.patch(123);
	expect(res).toBe(false);
});
