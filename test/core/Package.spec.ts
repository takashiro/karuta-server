import fs from 'fs';
import { pkg } from '../../src/core/Package';

it('catches all errors', async () => {
	const readFile = jest.spyOn(fs.promises, 'readFile').mockRejectedValue(new Error('unknown'));
	const version = await pkg.readVersion();
	expect(version).toBe('');
	readFile.mockRestore();
});

it('should read package version', async () => {
	const version = await pkg.readVersion();
	expect(version).toMatch(/^\d+\.\d+\.\d+$/);
});

it('should cache package version', async () => {
	const readFile = jest.spyOn(fs.promises, 'readFile');
	const version = await pkg.readVersion();
	expect(version).toMatch(/^\d+\.\d+\.\d+$/);
	expect(readFile).not.toBeCalled();
	readFile.mockRestore();
});
