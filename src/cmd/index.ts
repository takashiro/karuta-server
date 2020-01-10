import Command from '../net/Command';
import Action from '../net/Action';

import CheckVersion from './CheckVersion';

import Login from './Login';
import Logout from './Logout';

import CreateRoom from './CreateRoom';
import EnterRoom from './EnterRoom';
import LeaveRoom from './LeaveRoom';
import UpdateRoom from './UpdateRoom';

import Speak from './Speak';
import LoadGame from './LoadGame';

class CommandRouter {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	act: Map<Command, Action<any, any>>;

	constructor() {
		this.act = new Map();
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	add(action: Action<any, any>): void {
		const cmd = action.getCommand();
		this.act.set(cmd, action);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	get(command: Command): Action<any, any> | undefined {
		return this.act.get(command);
	}
}

const router = new CommandRouter();
router.add(new CheckVersion());
router.add(new Login());
router.add(new Logout());
router.add(new CreateRoom());
router.add(new EnterRoom());
router.add(new EnterRoom());
router.add(new LeaveRoom());
router.add(new UpdateRoom());
router.add(new Speak());
router.add(new LoadGame());

export default router;
