import {
	ContextListener,
	User,
} from '@karuta/core';

import DriverHandler from './DriverHandler';
import MessageHandler from './MessageHandler';
import RoomHandler from './RoomHandler';
import UserHandler from './UserHandler';
import UserSessionHandler from './UserSessionHandler';
import VersionHandler from './VersionHandler';

type Creator = new(user: User) => ContextListener;

const creators: Creator[] = [
	DriverHandler,
	MessageHandler,
	RoomHandler,
	UserHandler,
	UserSessionHandler,
	VersionHandler,
];

export default creators;
