import { User } from '@karuta/core';
import UserSessionHandler from '../../src/cmd/UserSessionHandler';

const setName = jest.fn();
const user = {
	getId: () => 123,
	setName,
} as unknown as User;
const handler = new UserSessionHandler(user);

it('changes user name on login stage', () => {
	const id = handler.post({ name: 'What!' });
	expect(id).toBe(123);
	expect(setName).toBeCalledWith('What!');
});
