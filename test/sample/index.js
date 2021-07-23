class GameDriver {
	constructor(room) {
		this.room = room;
		this.name = 'driver example';
		this.a = 1;
	}

	getName() {
		return this.name;
	}

	getProfile() {
		return {
			name: this.name,
			config: this.getConfig(),
		};
	}

	updateConfig(config) {
		this.a = config.a;
	}

	getConfig() {
		return {
			a: this.a,
		};
	}

	createContextListeners(user) {
		const listener = {
			context: 1234,
			put: () => {
				this.a += 1;
				user.setName('Robot A');
				return true;
			},
		};
		return [
			listener,
		];
	}
}

module.exports = GameDriver;
