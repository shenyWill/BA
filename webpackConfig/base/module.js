const Path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const Var = require('../define/varPath.js');
module.exports = {
    rules: [
        {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', 'sass-loader']
            })
        }, 
        {
            test: /\.js$/,
            use: [{
                loader: 'babel-loader',
                options:{
                    presets: ['es2015'] 
                }
            }],
            exclude: [
                Path.resolve(Var.APP_PATH, 'node_modules/'), 
                Path.resolve(Var.APP_PATH, 'js/lib/'),
                Path.resolve(Var.APP_PATH, 'js/plugins/'),
            ]
        }, 
        {
            test: /\.hbs$/,
            use: [{
                loader: 'handlebars-loader'
            }]
        }, 
        {
            test: /\.html$/,
            use: [{
                loader: 'html-loader'
            }],
            exclude: /node_modules/
        }, 
        {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use:[
                    {
                        loader: 'css-loader',
                        options:{
                            minimize: true //css压缩
                        }
                    }
                ]
            })
        }, 
        {
            test: /\.(woff|woff2|eot|ttf)(\?.*$|$)/,
            use: ['url-loader']
        }, 
        {
            test: /\.(svg)$/i,
            use: ['svg-sprite-loader'],
            include: Var.publish_SVG, 
        }, 
        {
            test: /\.(png|jpg|gif)$/,
            use: ['url-loader?limit=8192&name=images/[hash:8].[name].[ext]']
        }
    ]
}
