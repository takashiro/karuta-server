import path from 'path';
import DriverLoader from '../src/core/DriverLoader';

it('resolves entry script', () => {
	const loader = new DriverLoader('../../test/sample/fakeFn');
	expect(loader.resolveEntry()).toBe(path.join(__dirname, 'sample', 'fakeFn.js'));
});

it('resolves entry directory', () => {
	const loader = new DriverLoader('../../test/sample/fakeFn');
	expect(loader.resolveDir()).toBe(path.join(__dirname, 'sample'));
});

it('handles non-existing module', () => {
	const loader = new DriverLoader('../../test/sample/fakeFn2');
	expect(loader.isValid()).toBe(false);
});

it('returns resolved module', () => {
	const loader = new DriverLoader('../../test/sample/fakeFn');
	expect(loader.isValid()).toBe(true);
	const fakeFn = loader.load();
	expect(fakeFn.name).toBe('fakeFn');
});
