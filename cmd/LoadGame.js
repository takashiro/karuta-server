
//LoadGame
function LoadGame(driver) {
	let room = this.room;
	if (!room || room.owner != this) {
		return;
	}

	let loaded = room.loadExtension(driver);
	return loaded ? driver : null;
}

module.exports = LoadGame;
