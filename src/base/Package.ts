import fs from 'fs';
import path from 'path';

export default class Package {
	protected version = '';

	async readVersion(): Promise<string> {
		if (this.version) {
			return this.version;
		}

		const rootDir = path.dirname(path.dirname(__dirname));
		const pkgPath = path.join(rootDir, 'package.json');
		try {
			const pkg = JSON.parse(await fs.promises.readFile(pkgPath, 'utf-8'));
			this.version = pkg.version;
		} catch (e) {
			// Ignore
		}
		return this.version;
	}
}

export const pkg = new Package();
