const Webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const uglifyJsPlugin = Webpack.optimize.UglifyJsPlugin;
const optimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ConfigPlugins = require('../define/plugin-define.js');
const Router = require('../define/router.js');

// css分离文件
ConfigPlugins.push(
	new ExtractTextPlugin({
        filename: 'css/customer/[name]-[chunkhash:8].css',
        allChunks: true,
    })
);

//处理chunks公共页面
var chunksAray = [];
for(var page in Router){
	chunksAray[page] = Router[page].entry;
}

// 公共chunk
ConfigPlugins.push(
	new Webpack.optimize.CommonsChunkPlugin({	
			name: 'base-common',
			filename: 'js/basecommon-[chunkhash:8].js',
			chunks: chunksAray
		})
);

ConfigPlugins.push(
	// css压缩
	new optimizeCssAssetsPlugin({}),
	// js压缩
	new uglifyJsPlugin({
	    compress: {
	        warnings: false,
	    }
	})
)
module.exports = ConfigPlugins;