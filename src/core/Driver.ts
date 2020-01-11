import Action from '../net/Action';

interface Driver {
	getName(): string;

	setConfig(config: object): void;
	getConfig(): object;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	getAction(command: number): Action<any, any>;
}

export default Driver;
