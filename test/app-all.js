
const net = require('net');

const localhost = '127.0.0.1';

function occupyPort(port) {
	const server = net.createServer(function (socket) {
		socket.write('This is a test');
	});

	server.listen(port, localhost);

	return new Promise(function (resolve, reject) {
		server.on('error', reject);
		server.on('listening', function () {
			server.close();
			resolve();
		});
	});
}

describe('App', () => {
	let app = null;

	const port = Math.floor(Math.random() * 55536) + 10000;
	it('should be started at ' + port, async () => {
		const App = require('../core/App');
		app = new App({ socket: {port, host: localhost} });
		await app.start();
	});

	it('should be using port ' + port, async () => {
		try {
			await occupyPort(port);
			return Promise.reject(new Error('The port is not in use'));
		} catch (error) {
			return Promise.resolve();
		}
	});

	it('should be stopped', async () => {
		await app.stop();
	});
});
