const path = require('path');
module.exports = {
    entry: ['babel-polyfill', './src/js/index.js'],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};