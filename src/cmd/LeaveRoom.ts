
export default function LeaveRoom() {
	const { room } = this;
	if (room) {
		room.removeUser(this);
	}
}
