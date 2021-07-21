import { Room, User } from '@karuta/core';
import MessageHandler from '../../src/cmd/MessageHandler';

const user = {} as unknown as User;
const broadcast = jest.fn();
const room = {
	broadcast,
} as unknown as Room;
const handler = new MessageHandler(user);
const getRoom = jest.spyOn(handler, 'getRoom').mockReturnValue(room);

it('accepts string only', () => {
	handler.post({ a: 2 });
	expect(getRoom).not.toBeCalled();
	expect(broadcast).not.toBeCalled();
});

it('does nothing in the lobby', () => {
	getRoom.mockReturnValueOnce(undefined);
	handler.post('test');
	expect(broadcast).not.toBeCalled();
});
