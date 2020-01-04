import { Command } from './index';

export default function Speak(message) {
	const { room } = this;
	if (!room) {
		return;
	}

	room.broadcast(Command.Speak, {
		user: this.id,
		message,
	});
}
