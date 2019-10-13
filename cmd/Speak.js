
const cmd = require('./index');

function Speak(message) {
	const { room } = this;
	if (!room) {
		return;
	}

	room.broadcast(cmd.Speak, {
		user: this.id,
		message,
	});
}

module.exports = Speak;
