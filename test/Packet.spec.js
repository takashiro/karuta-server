import Packet from '../src/core/Packet';

describe('Packet', () => {
	test('parses from an array', () => {
		const data = [1, { a: 2 }];
		const packet = Packet.parse(JSON.stringify(data));
		expect(data[0]).toBe(packet.command);
		expect(data[1]).toEqual(packet.arguments);
	});

	test('converted to string', () => {
		const packet = new Packet();
		packet.command = -3;
		packet.arguments = { test: 3 };
		const str = packet.toJSON();
		const data = JSON.parse(str);
		expect(packet.command).toBe(data[0]);
		expect(packet.arguments).toEqual(data[1]);
	});
});
