
import Room from '../core/Room';

export default function CreateRoom() {
	const { lobby } = this;
	if (!lobby) {
		return 0;
	}

	const room = new Room(this);
	lobby.addRoom(room);

	return room.id;
}
