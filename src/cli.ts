#!/usr/bin/env node

import Config from './core/Config';
import App from './core/App';

(async function main(): Promise<void> {
	const config = new Config();
	await config.load();
	const app = new App(config);
	await app.start();
}());
