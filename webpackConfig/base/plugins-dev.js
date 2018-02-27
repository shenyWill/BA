const Webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ConfigPlugins = require('../define/plugin-define.js');
const Router = require('../define/router.js');
// css分离文件
ConfigPlugins.push(
	new ExtractTextPlugin("css/customer/[name].css")
);
//处理chunks公共页面
var chunksAray = [];
for(var page in Router){
	chunksAray[page] = Router[page].entry;
}

// 公共chunk
ConfigPlugins.push(
	new Webpack.optimize.CommonsChunkPlugin({	
			name: 'base',
			filename: 'js/base.js',
			chunks: chunksAray
		})
);

module.exports = ConfigPlugins;