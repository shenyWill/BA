const Path = require('path');
const Webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const uglifyJsPlugin = Webpack.optimize.UglifyJsPlugin;
const optimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

var APPPath = {};

// WEB项目根目录路径
APPPath.WEB_PATH = __dirname.match('(.*)skin.*')[1];

// 前端项目根目录
APPPath.APP_PATH = Path.resolve(__dirname, '../../');

//模板名字
APPPath.APP_THEME = 'ba_pc_v1';

// 页面模板目录路径
APPPath.TMPL_PATH = Path.resolve(APPPath.WEB_PATH, 'app/design/frontend/PlumTree/'+APPPath.APP_THEME+'/template/page/html/headTmpl/'); 

// 页面模板输出目录路径
APPPath.TMPL_OUTPUT_PATH = Path.resolve(APPPath.WEB_PATH, 'app/design/frontend/PlumTree/'+APPPath.APP_THEME+'/template/page/html/head/');

// 入口JS文件路径
APPPath.ENTRY_PATH = Path.resolve(APPPath.APP_PATH, './build_js/');

//SKIN目录
APPPath.publish_SKIN = '/skin/frontend/PlumTree/'+APPPath.APP_THEME;

//svgs目录
APPPath.publish_SVG = Path.resolve(APPPath.APP_PATH, '/skin/frontend/PlumTree/'+APPPath.APP_THEME+'/svgs/');


//console.log(APPPath.ENTRY_PATH)

module.exports = APPPath;