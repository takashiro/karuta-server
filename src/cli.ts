#!/usr/bin/env node

import Config from './base/Config';
import App from './base/App';

(async function main(): Promise<void> {
	const config = new Config();
	await config.load();
	const app = new App(config);
	await app.start();
}());
