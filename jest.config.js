// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	collectCoverage: true,
	collectCoverageFrom: [
		'./src/**/*.ts',
	],
	coverageDirectory: 'build',
	globals: {
		'ts-jest': {
			tsconfig: 'test/tsconfig.json',
		},
	},
};
