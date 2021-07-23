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
const getLobby = jest.spyOn(handler, 'getLobby');
const getRoom = jest.spyOn(handler, 'getRoom').mockReturnValue(room);
getOwner.mockReturnValue(user);

it('cannot create a room without a lobby', () => {
	getLobby.mockReturnValueOnce(undefined);
	const res = handler.put();
	expect(res).toBe(0);
});

it('returns nothing without a lobby', () => {
	getLobby.mockReturnValueOnce(undefined);
	const res = handler.get({ id: 1 });
	expect(res).toBe(undefined);
});

it('cannot enter any room without a lobby', () => {
	getLobby.mockReturnValueOnce(undefined);
	const res = handler.post({ id: 1 });
	expect(res).toBe(undefined);
});

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
