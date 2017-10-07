var path = require('path');
var webpack = require('webpack');

 module.exports = {
     entry: './src/main.js',
     output: {
         filename: 'bundle.js'
     },
     module: {
         loaders: [
             {
                 test: /\.js$/,
                 loader: 'babel-loader',
                 query: {
                     presets: ['env', 'es2015']
                 },
                 exclude: /node_modules/
             }
         ]
     },
     devtool: 'source-map'
 };
