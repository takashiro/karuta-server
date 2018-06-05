
class Packet {

	/**
	 * Create a network packet
	 */
	constructor(data = null) {
		this.command = 0;
		this.arguments = null;
	}

	/**
	 * Parse a packet from JSON string representation
	 * @param {string} data JSON string representation
	 * @return {boolean} whether data is a valid packet
	 */
	parse(data) {
		try {
			data = JSON.parse(data);
			if (data instanceof Array) {
				this.command = data[0];
				this.arguments = data[1];
				return true;
			}
		} catch (error) {
			console.log(error);
		}
		return false;
	}

	/**
	 * Convert a packet into JSON string representation
	 * @return {string} JSON string representation
	 */
	toJSON() {
		return JSON.stringify([
			this.command,
			this.arguments,
		]);
	}

}

module.exports = Packet;
