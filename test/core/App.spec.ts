import { Server } from 'http';
import App from '../../src/core/App';
import Config from '../../src/core/Config';

const config = new Config();
const app = new App(config);

it('throws error if failed to close server', async () => {
	const server = Reflect.get(app, 'server') as Server;
	jest.spyOn(server, 'close').mockImplementation((callback) => {
		callback(new Error('3748'));
		return server;
	});
	await expect(() => app.stop()).rejects.toThrowError('3748');
});
