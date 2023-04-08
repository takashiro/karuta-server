// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	collectCoverage: true,
	collectCoverageFrom: [
		'./src/**/*.ts',
		'!./src/*.ts',
	],
	coverageDirectory: 'build',
	transform: {
		'^.+\\.ts$': [
			'ts-jest',
			{
				tsconfig: 'test/tsconfig.json',
			},
		],
	},
};
