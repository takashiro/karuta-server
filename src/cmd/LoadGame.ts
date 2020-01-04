
// LoadGame
export default function LoadGame(driver) {
	const { room } = this;
	if (!room || room.owner !== this) {
		return null;
	}

	const loaded = room.loadExtension(driver);
	return loaded ? driver : null;
}
