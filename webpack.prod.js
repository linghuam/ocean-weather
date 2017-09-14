const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MinifyPlugin = require("babel-minify-webpack-plugin");
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
    devtool: 'cheap-module-source-map',
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            //打包除这个文件之外的文件
            exclude: [
                path.resolve(__dirname, "./node_modules")
            ],
            //打包包括的文件
            include: [
                path.resolve(__dirname, "./src/js"),
            ]
        }]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        // new HtmlWebpackPlugin(),
        new MinifyPlugin(),
    ]
});