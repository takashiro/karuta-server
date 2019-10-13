const cmd = require('../cmd');

const act = new Map();

for (const key of Object.keys(cmd)) {
	const id = cmd[key];

	try {
		const func = require(`../cmd/${key}`);
		act.set(id, func);
	} catch (error) {
		// TODO: Add log or default handler
	}
}

module.exports = act;
