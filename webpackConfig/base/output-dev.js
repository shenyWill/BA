const path = require('path');
const Var = require('../define/varPath.js');

module.exports = {
	path: path.resolve(Var.APP_PATH + '/dist/'),
	publicPath: Var.publish_SKIN+'/dist/',
	filename: 'js/[name].js',
	chunkFilename: 'js/[name].js',
}



