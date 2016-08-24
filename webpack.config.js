const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const DashboardPlugin = require('webpack-dashboard/plugin');

module.exports = {
	target: 'node',
	devtool: 'source-map',
	entry: './index.js',
	output: {
		path: './dist/',
		filename: 'bundle.js'
	},
	externals: [nodeExternals()],
	plugins: [
		new DashboardPlugin()
	],
	module: {
		loaders: [
			{
				test:/\.js$/,
				exclude: /node_modules/,
				loaders: [
					'babel'
				]
			},
			{
				test: /\.json$/,
				loader: 'json'
			}
		]
	},
	resolve: {
		extensions: ['', '.js', '.json']
	}
};
