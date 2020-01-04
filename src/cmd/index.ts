import CheckVersion from './CheckVersion';

import Login from './Login';
import Logout from './Logout';

import CreateRoom from './CreateRoom';
import EnterRoom from './EnterRoom';
import LeaveRoom from './LeaveRoom';
import UpdateRoom from './UpdateRoom';

import Speak from './Speak';
import LoadGame from './LoadGame';

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
};

type CommandCallback = (args: any) => void;

const act = new Map<Command, CommandCallback>();
act.set(Command.CheckVersion, CheckVersion);
act.set(Command.Login, Login);
act.set(Command.Logout, Logout);
act.set(Command.CreateRoom, CreateRoom);
act.set(Command.EnterRoom, EnterRoom);
act.set(Command.LeaveRoom, LeaveRoom);
act.set(Command.UpdateRoom, UpdateRoom);
act.set(Command.Speak, Speak);
act.set(Command.LoadGame, LoadGame);

export const CommandMap = act;
