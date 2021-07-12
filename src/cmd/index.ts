import { ContextListener } from '@karuta/protocol';
import { User } from '@karuta/core';

import DriverHandler from './DriverHandler';
import MessageHandler from './MessageHandler';
import RoomHandler from './RoomHandler';
import UserSessionHandler from './UserSessionHandler';
import VersionHandler from './VersionHandler';

type Creator = new(user: User) => ContextListener;

const creators: Creator[] = [
	DriverHandler,
	MessageHandler,
	RoomHandler,
	UserSessionHandler,
	VersionHandler,
];

export default creators;
