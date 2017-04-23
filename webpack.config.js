module.exports = {
	entry: './src/index.js',
	target: 'node',
	/*output: {
		path: '.webpack',
		filename: 'index.js',
		libraryTarget: 'commonjs'
	},*/

	module: {
		preLoaders: [
			{ test: /\.json$/, loader: 'json-loader' },
		],
		loaders: [
			{ test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
		]
	}
};
