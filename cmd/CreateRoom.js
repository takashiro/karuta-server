
const Room = require('../core/Room');

function CreateRoom() {
	let lobby = this.lobby;
	if (!lobby) {
		return;
	}

	let room = new Room(this);
	lobby.addRoom(room);

	return room.id;
}

module.exports = CreateRoom;
