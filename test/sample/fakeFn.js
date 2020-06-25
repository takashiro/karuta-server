function fakeFn() {
	throw new Error('Do not call me.');
}

module.exports = fakeFn;
