
const cmd = require('./index');

function Speak(message) {
	let room = this.room;
	if (!room) {
		return;
	}

	room.broadcast(cmd.Speak, {
		user: this.id,
		message: message
	});
}

module.exports = Speak;
