
const net = require('net');

function occupyPort(port) {
	const server = net.createServer(function (socket) {
		socket.write('This is a test');
	});

	server.listen(port, 'localhost');

	return new Promise(function (resolve, reject) {
		server.on('error', resolve);
		server.on('listening', function () {
			server.close();
			reject();
		});
	});
}

describe('App', () => {
	let app = null;

	const port = Math.floor(Math.random() * 55536) + 10000;
	it('should be started at ' + port, async () => {
		const App = require('../core/App');
		app = new App({ socket: port });
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
