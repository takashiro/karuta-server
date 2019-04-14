
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
	 * @return {boolean} whether data is a valid packet
	 */
	static parse(data) {
		let arg = JSON.parse(data);
		if (arg instanceof Array) {
			let packet = new Packet;
			packet.command = arg[0];
			packet.arguments = arg[1];
			return packet;
		} else {
			throw new Error('The packet must be an array.');
		}
	}

	/**
	 * Convert a packet into JSON string representation
	 * @return {string} JSON string representation
	 */
	toJSON() {
		let json = [this.command];
		if (this.arguments !== undefined && this.arguments !== null) {
			json.push(this.arguments);
		}
		return JSON.stringify(json);
	}

}

module.exports = Packet;
