
function LeaveRoom() {
	let room = this.room;
	if (room) {
		room.removeUser(this);
	}
}

module.exports = LeaveRoom;
