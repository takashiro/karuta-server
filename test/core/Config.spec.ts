import path from 'path';
import fs from 'fs';

import Config from '../../src/core/Config';

it('has default options', () => {
	const config = new Config();
	expect(config.getSocket()).toBe('/var/run/karuta-server.sock');
});

it('can read settings from a file', async () => {
	const config = new Config();
	await config.load(path.resolve(__dirname, '..', 'sample', 'karuta.config.json'));
	expect(config.getSocket()).toBe(5260);
	expect(Reflect.get(config, 'test')).toBeUndefined();
});

it('reads config.json by default', async () => {
	const readFile = jest.spyOn(fs.promises, 'readFile').mockResolvedValue('{}');
	const config = new Config();
	await config.load();
	expect(readFile).toBeCalledWith('config.json', 'utf-8');
	readFile.mockRestore();
});
