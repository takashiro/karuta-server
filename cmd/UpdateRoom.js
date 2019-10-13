
const cmd = require('./index');

function UpdateRoom(config) {
	const { room } = this;
	if (!room || room.owner !== this) {
		return;
	}

	room.updateConfig(config);
	room.broadcast(cmd.UpdateRoom, room.getConfig());
}

module.exports = UpdateRoom;
