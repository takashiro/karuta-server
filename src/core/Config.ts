interface SocketOptions {
	host: string;
	port: number;
}

interface Config {
	socket: string | number | SocketOptions;
}

export default Config;
