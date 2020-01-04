import * as fs from 'fs';
import * as util from 'util';

const readFile = util.promisify(fs.readFile);

/**
 * Read configuration from config.json in current working directory.
 */
export default async function readConfig(): Promise<object> {
	let configFile = './config.json';
	for (const argv of process.argv) {
		if (argv.startsWith('--config=')) {
			configFile = argv.substr(9);
		}
	}

	try {
		const config = await readFile(configFile, 'utf-8');
		return JSON.parse(config);
	} catch (error) {
		console.log(error);
	}

	return {};
}
