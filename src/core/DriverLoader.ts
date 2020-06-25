import fs from 'fs';
import path from 'path';
import { Driver } from '@karuta/core';

export default class DriverLoader {
	protected name: string;

	constructor(name: string) {
		this.name = name;
	}

	resolveEntry(): string {
		try {
			return require.resolve(this.name);
		} catch (error) {
			return '';
		}
	}

	resolveDir(): string {
		const modulePath = this.resolveEntry();
		if (!modulePath) {
			return '';
		}
		return path.dirname(modulePath);
	}

	isValid(): boolean {
		const rootDir = this.resolveDir();
		if (!rootDir) {
			return false;
		}

		return fs.existsSync(path.join(rootDir, 'karuta.config.json'));
	}

	load(): new(owner: object) => Driver {
		// eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires
		const extension = require(this.name);
		return extension.default || extension;
	}
}
