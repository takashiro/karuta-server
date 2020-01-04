import App from './core/App';
import readConfig from './util/readConfig';

// Start up application
(async function () {
	const config = await readConfig();
	const app = new App(config);
	await app.start();
}());
