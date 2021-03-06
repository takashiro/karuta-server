export default class Packet {
	command: number;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	arguments: any;

	/**
	 * Create a network packet
	 */
	constructor() {
		this.command = 0;
		this.arguments = null;
	}

	/**
	 * Parse a packet from JSON string representation
	 * @param data JSON string representation
	 * @return a valid packet
	 */
	static parse(data: string): Packet {
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
	 * @return JSON string representation
	 */
	toJSON(): string {
		const json = [this.command];
		if (this.arguments !== undefined && this.arguments !== null) {
			json.push(this.arguments);
		}
		return JSON.stringify(json);
	}
}
