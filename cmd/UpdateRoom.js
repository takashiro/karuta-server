
const cmd = require('./index');

function UpdateRoom(config) {
	let room = this.room;
	if (!room || room.owner != this) {
		return;
	}

	room.updateConfig(config);
	room.broadcast(cmd.UpdateRoom, room.getConfig());
}

module.exports = UpdateRoom;
