const merge = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    devtool: 'inline-source-map',
    devServer: {
        publicPath: '/dist/',
        host: 'localhost',
        port: 8088,
        hot: true
    },
    module: {
        rules:[
            // {
            //     test: /\.js$/,
            //     loader:'eslint-loader',
            // },
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
});