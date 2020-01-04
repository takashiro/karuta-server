
function LeaveRoom() {
	const { room } = this;
	if (room) {
		room.removeUser(this);
	}
}

module.exports = LeaveRoom;
