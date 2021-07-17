import fs from 'fs/promises';

interface SocketOptions {
	host: string;
	port: number;
}

type Socket = string | number | SocketOptions;

export default class Config {
	protected socket: Socket = '/var/run/karuta-server.sock';

	getSocket(): Socket {
		return this.socket;
	}

	setSocket(socket: Socket): void {
		this.socket = socket;
	}

	/**
   * Read configuration.
   */
	async load(configFile = 'config.json'): Promise<void> {
		const content = await fs.readFile(configFile, 'utf-8');
		const config = JSON.parse(content);

		for (const key of Object.keys(this)) {
			Reflect.set(this, key, config[key]);
		}
	}
}
