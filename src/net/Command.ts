/**
 * System command between server and clients
 */
export enum Command {
	Invalid = 0,

	CheckVersion = -1,

	Login = -2,
	Logout = -3,

	CreateRoom = -4,
	EnterRoom = -5,
	LeaveRoom = -6,
	UpdateRoom = -7,

	SetUserList = -8,
	AddUser = -9,
	RemoveUser = -10,

	Speak = -11,
	LoadGame = -12,
}

export default Command;
