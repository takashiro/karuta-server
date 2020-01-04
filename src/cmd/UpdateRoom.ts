import { Command } from './index';

export default function UpdateRoom(config) {
	const { room } = this;
	if (!room || room.owner !== this) {
		return;
	}

	room.updateConfig(config);
	room.broadcast(Command.UpdateRoom, room.getConfig());
}
