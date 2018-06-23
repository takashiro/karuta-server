
const Enum = require('./Enum');

const net = new Enum(
	'Invalid',

	'CheckVersion',

	'Login',
	'Logout',

	'CreateRoom',
	'EnterRoom',
	'LeaveRoom',
	'UpdateRoom',

	'SetUserList',
	'AddUser',
	'RemoveUser',

	'Speak',
	'LoadGame',

	'CommandCount',
);

module.exports = net;
