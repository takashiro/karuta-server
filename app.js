
const App = require('./core/App');

// Load configurations
const config = (function () {
	let configFile = './config.json';
	for (const argv of process.argv) {
		if (argv.startsWith('--config=')) {
			configFile = argv.substr(9);
		}
	}

	try {
		return require(configFile);
	} catch (error) {
		console.log(error);
	}

	return {};
}());

// Start up application
(async function () {
	const app = new App(config);
	await app.start();
}());
