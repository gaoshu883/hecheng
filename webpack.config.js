const webpack = require('webpack');
const path = require('path');

module.exports = {
  context: __dirname + '/app/scripts.babel/',
  entry: {
    background: './background.js',
    chromereload: './chromereload.js',
    contentscript: './contentscript.js',
    popup: './popup.js'
  },
  output: {
    filename: '[name].js'
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'  // Use the full build
    }
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader'
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }]
  },
  mode: 'none'
}