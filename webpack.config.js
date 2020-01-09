const path = require('path');

const externals = [
	'ws',
];

module.exports = function (env, argv) {
	const mode = (argv && argv.mode) || 'production';
	return {
		mode,
		target: 'node',
		entry: {
			app: './src/app.ts',
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					use: 'ts-loader',
					exclude: /node_modules/,
					parser: {
						commonjs: false,
					},
				},
			],
		},
		resolve: {
			extensions: [
				'.ts',
			],
		},
		externals: externals.reduce((prev, cur) => {
			prev[cur] = `commonjs ${cur}`;
			return prev;
		}, {}),
		output: {
			filename: '[name].js',
			path: path.join(__dirname, 'dist'),
			devtoolModuleFilenameTemplate : '[absolute-resource-path]',
		},
		devtool: mode !== 'production' ? 'source-map' : undefined,
	};
};
