
const assert = require('assert');
const Packet = require('../core/Packet');

describe('Packet', () => {
	it('parses from an array', () => {
		const data = [1, { a: 2 }];
		const packet = Packet.parse(JSON.stringify(data));
		assert.deepEqual(data[0], packet.command);
		assert.deepEqual(data[1], packet.arguments);
	});

	it('converted to string', () => {
		const packet = new Packet();
		packet.command = -3;
		packet.arguments = { test: 3 };
		const str = packet.toJSON();
		const data = JSON.parse(str);
		assert.deepEqual(packet.command, data[0]);
		assert.deepEqual(packet.arguments, data[1]);
	});
});
