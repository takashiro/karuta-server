
const WebSocket = require('ws');

const karuta = require('./core');

const wss = new WebSocket.Server({
	port: 2517
});
const lobby = new karuta.Lobby;

wss.on('connection', socket => {
	let user = new karuta.User(socket);
	user.on('action', packet => {
		let action = karuta.actions.get(packet.command);

		if (!action && user.room) {
			let room = user.room;
			let actions = room.driver && room.driver.actions;
			if (actions) {
				action = actions.get(packet.command);
			}
		}

		if (action) {
			action.call(user, packet.arguments);
		}
	});
	lobby.addUser(user);
});
