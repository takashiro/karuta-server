import net from 'net';

import App from '../src/core/App';

const localhost = '127.0.0.1';

function occupyPort(port: number): Promise<void> {
	const server = net.createServer((socket) => {
		socket.write('This is a test');
	});

	server.listen(port, localhost);

	return new Promise(((resolve, reject) => {
		server.on('error', reject);
		server.on('listening', () => {
			server.close();
			resolve();
		});
	}));
}

describe('App', () => {
	let app = null;

	const port = Math.floor(Math.random() * 55536) + 10000;
	test(`should be started at ${port}`, async () => {
		app = new App({ socket: { port, host: localhost } });
		await app.start();
	});

	test(`should be using port ${port}`, async () => {
		try {
			await occupyPort(port);
			return Promise.reject(new Error('The port is not in use'));
		} catch (error) {
			return Promise.resolve();
		}
	});

	test('should be stopped', async () => {
		await app.stop();
	});
});
