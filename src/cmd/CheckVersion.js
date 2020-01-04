
function CheckVersion() {
	const version = require('../core/version.json');
	return version;
}

module.exports = CheckVersion;
