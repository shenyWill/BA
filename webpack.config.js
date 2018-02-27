const webpack = require('webpack');
const Path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeEnv = process.env.NODE_ENV;
nodeEnv ? isPro = true : isPro = false; 
console.log('环境是' + nodeEnv+isPro);
'use strict';


module.exports = {
    entry: require('./webpackConfig/define/entry.js'),
    output: isPro ? require('./webpackConfig/base/output-pro.js') : require('./webpackConfig/base/output-dev.js'),

    module: require('./webpackConfig/base/module.js'),
    devServer: {
        historyApiFallback: true,
        noInfo: true
    },
    performance: {
        hints: false
    },
    devtool: isPro ? '#cheap-module-source-map' : '#cheap-module-eval-source-map',
    plugins: isPro ? require('./webpackConfig/base/plugins-pro.js') : require('./webpackConfig/base/plugins-dev.js'),
    resolve: {
        extensions: [".js", ".scss", ".json"],
        modules: ['node_modules', Path.join(__dirname, './node_modules')],
        alias: {
            scss: Path.resolve(__dirname, 'scss'),
            css: Path.resolve(__dirname, 'css'),
            build_js: Path.resolve(__dirname, 'build_js')
        }
    },
    externals: require('./webpackConfig/base/externals.js')
}