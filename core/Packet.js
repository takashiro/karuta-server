
class Packet {
	/**
	 * Create a network packet
	 */
	constructor() {
		this.command = 0;
		this.arguments = null;
	}

	/**
	 * Parse a packet from JSON string representation
	 * @param {string} data JSON string representation
	 * @return {Packet} a valid packet
	 */
	static parse(data) {
		const arg = JSON.parse(data);
		if (arg instanceof Array) {
			const packet = new Packet();
			[packet.command, packet.arguments] = arg;
			return packet;
		}
		throw new Error('The packet must be an array.');
	}

	/**
	 * Convert a packet into JSON string representation
	 * @return {string} JSON string representation
	 */
	toJSON() {
		const json = [this.command];
		if (this.arguments !== undefined && this.arguments !== null) {
			json.push(this.arguments);
		}
		return JSON.stringify(json);
	}
}

module.exports = Packet;
