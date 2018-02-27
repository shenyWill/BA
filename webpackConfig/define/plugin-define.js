const Path = require('path');
const Webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const uglifyJsPlugin = Webpack.optimize.UglifyJsPlugin;
const optimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const Var = require('./varPath.js');
const Router = require('./router.js');

var plugins = [];
//生成个模块页面
for (page in Router) {
	//登录注册特殊头部
	let headDefault = './default.phtml';
	if (page == 'login' || page == 'register' || page == 'findPassword') {
		headDefault = './reg-login.phtml';
	} else if (page == 'ajaxform' || page == 'getLogin') {
		headDefault = './ajaxform.phtml';
	} else{
		headDefault = './header.phtml';
	}
	let Defer = 'defer';
	page == 'base' ? Defer = '' : Defer;
	if(!Router[page].noHtml){
		//console.log(Router[page].chunkArr);
		var htmlPage = new HtmlWebpackPlugin({
			chunks: Router[page].chunkArr,
			filename: Path.resolve(Var.TMPL_OUTPUT_PATH, page + 'Head.phtml'),
			template: Path.resolve(Var.TMPL_PATH, headDefault),
			inject: false,
			files:{
				defer:Defer
			},
			showErrors:true,
			minify: { //压缩HTML文件
				removeComments: true, //移除HTML中的注释
				collapseWhitespace: false //删除空白符与换行符
			}
		});
	}
	plugins.push(htmlPage);
};
plugins.push(
	new CleanWebpackPlugin([Path.resolve(Var.publish_SKIN, 'dist/*')]), // 清理dist 文件夹
	new CleanWebpackPlugin([Path.resolve(Var.TMPL_OUTPUT_PATH, 'head/*')]), // 清理head文件夹
	new Webpack.LoaderOptionsPlugin({
		options: {
			postcss: function () {
				return [
					require("autoprefixer")({
						browsers: ['ie>=8', '>1% in CN', 'last 5 versions', 'Android >= 4.0']
					}),
					require('postcss-assets')({
						loadPaths: [Path.resolve(Var.APP_PATH, './images/')]
					}),
					require('cssnano')({
						core: true,
					}),
					require('postcss-sprites')({
						styleFilePath: Path.resolve(Var.APP_PATH, './release/css/'),
						spritePath: Path.resolve(Var.APP_PATH, './images/sprite/'),
						filterBy: function (image) {
							if (/sprite/.test(image.url) && !/sprite\./.test(image.url)) {
								return Promise.resolve();
							}
							return Promise.reject();
						},
						groupBy: function (image) {

							var name = image.url.match(/\/images\/sprite\/(.*?)-(.*?)\.png/)[1];
							if (name) {
								return Promise.resolve(name);
							}
							return Promise.reject();
						},
						spritesmith: {
							padding: 0
						}
					})
				]
			}
		}
	}),
	new Webpack.optimize.UglifyJsPlugin({
		compress:{
			warnings:false
		},
		output: {
			comments: false,
		}
	}),
	new Webpack.optimize.ModuleConcatenationPlugin(),
	new Webpack.optimize.OccurrenceOrderPlugin()
);

module.exports = plugins;