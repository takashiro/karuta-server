
const WebSocket = require('ws');

const karuta = require('./core');

const wss = new WebSocket.Server({
	port: 2517
});
const server = new karuta.Server;

wss.on('connection', socket => {
	let user = new karuta.User(socket);
	user.on('action', packet => {
		const action = karuta.actions.get(packet.command);
		if (action) {
			action.call(user, packet.arguments);
		}
	});
	server.addUser(user);
});
