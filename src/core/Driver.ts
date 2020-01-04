import Action from './Action';

interface Driver {
	getName(): string;
	setConfig(config: object): void;
	getConfig(): object;
	getAction(command: number): Action;
}

export default Driver;
