
const net = require('./protocol');

const Room = require('./Room');

const act = new Map;

//CheckVersion
act.set(net.CheckVersion, function () {
	const version = require('./version.json');
	this.send(net.CheckVersion, version);
});

//Login
act.set(net.Login, function (credential) {
	//TO-DO
	if (credential) {
		this.name = credential.name;
	}
	this.send(net.Login, this.id);
});

//Logout
act.set(net.Logout, function () {
	this.disconnect();
});

//CreateRoom
act.set(net.CreateRoom, function () {
	let lobby = this.lobby;
	if (!lobby) {
		return;
	}

	let room = new Room(this);
	lobby.addRoom(room);

	this.send(net.CreateRoom, room.id);
});

//EnterRoom
act.set(net.EnterRoom, function (id) {
	let lobby = this.lobby;
	if (!lobby) {
		return;
	}

	let room = lobby.findRoom(id);
	if (room) {
		room.addUser(this);
		this.send(net.EnterRoom, id);
	} else {
		this.send(net.EnterRoom);
	}
});

//LeaveRoom
act.set(net.LeaveRoom, function () {
	let room = this.room;
	if (room) {
		room.removeUser(this);
	}
});

//UpdateRoom
act.set(net.UpdateRoom, function (config) {
	let room = this.room;
	if (!room || room.owner != this) {
		return;
	}

	room.updateConfig(config);
	room.broadcast(net.UpdateRoom, room.getConfig());
});

//Speak
act.set(net.Speak, function (message) {
	let room = this.room;
	if (!room) {
		return;
	}

	room.broadcast(net.Speak, {
		user: this.id,
		message: message
	});
});

//LoadGame
act.set(net.LoadGame, function (driver) {
	let room = this.room;
	if (!room || room.owner != this) {
		return;
	}

	let loaded = room.loadExtension(driver);
	this.send(net.LoadGame, loaded ? driver : null);
});

module.exports = act;
