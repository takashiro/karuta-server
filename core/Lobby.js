
class Lobby {

	/**
	 * Create a new instance of Server
	 */
	constructor() {
		this.users = new Map;
		this.nextUserId = 0;
		this.rooms = new Map;
		this.nextRoomId = 0;
	}

	/**
	 * Add a new room
	 * @param {Room} room
	 */
	addRoom(room) {
		this.nextRoomId++;
		room.id = this.nextRoomId;
		this.rooms.set(room.id, room);

		room.once('close', () => this.removeRoom(room.id));
	}

	/**
	 * Find a room by room id
	 * @param {number} id room id
	 */
	findRoom(id) {
		return this.rooms.get(id);
	}

	/**
	 * Remove a room by room id
	 * @param {number} id room id
	 */
	removeRoom(id) {
		this.rooms.delete(id);
	}

	/**
	 * Add a new connected user and assign user id
	 * @param {User} user the user instance
	 */
	addUser(user) {
		this.nextUserId++;
		user.id = this.nextUserId;
		user.lobby = this;

		this.users.set(user.id, user);
		user.on('close', () => this.removeUser(user.id));
	}

	/**
	 * Find a user by user id
	 * @param {number} id user id
	 * @return {User}
	 */
	findUser(id) {
		return this.users.get(id);
	}

	/**
	 * Remove a user by user id
	 * @param {number} id user id
	 */
	removeUser(id) {
		this.users.delete(id);
	}

}

module.exports = Lobby;
