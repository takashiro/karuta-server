

function EnterRoom(id) {
	let lobby = this.lobby;
	if (!lobby) {
		return;
	}

	let room = lobby.findRoom(id);
	if (room) {
		room.addUser(this);
		return room.id;
	} else {
		return -1;
	}
}

module.exports = EnterRoom;
