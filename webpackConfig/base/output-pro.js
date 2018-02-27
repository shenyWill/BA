const path = require('path');
const Var = require('../define/varPath.js');

module.exports = {
	path: path.resolve(Var.APP_PATH + '/release/'),
	publicPath: Var.publish_SKIN+'/release/',
	filename: 'js/[name]-[chunkhash:8].js',
	chunkFilename: 'js/[name]-[chunkhash:8].js',
}