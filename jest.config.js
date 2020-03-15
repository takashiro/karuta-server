// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
	preset: 'ts-jest',
	collectCoverage: true,
	collectCoverageFrom: [
		'./src/**/*.ts',
	],
	coverageDirectory: 'build',
	testEnvironment: 'node',
	transform: {
		'\.js$': 'ts-jest',
	},
};
