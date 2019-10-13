
function EnterRoom(id) {
	const { lobby } = this;
	if (!lobby) {
		return -1;
	}

	const room = lobby.findRoom(id);
	if (room) {
		room.addUser(this);
		return room.id;
	}
	return -1;
}

module.exports = EnterRoom;
