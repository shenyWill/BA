//不需要打包的模块
const Webpack = require('webpack');
const externals = [];
// 不需要打包的模块
externals.push({
	'react': 'React',
    'zepto': 'Zepto'
});
module.exports = externals;