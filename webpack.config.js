const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  context: path.resolve(__dirname, './src'),
  devtool: "source-map",
  entry: {
    app: './app.js',
    nohApp: './nohApp.js',
    app0: './app0.js',
    app2: './app2.js',
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundle.js',
    sourceMapFilename: "[name].bundle.js.map",
  },
  devServer: {
  	contentBase: path.join(__dirname, "dist"),
  	port: 8080
  },
  externals: [
    { three: 'THREE' }
  ],
  module: {
    rules: [
      {
        test: /\.exec\.js$/,
        use: ['script-loader']
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015', 'stage-2']
          }
        }
      },
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      // {output}/file.txt
      { from: '../node_modules/three/build/three.min.js',
        to: 'three.min.js' },
      { from: '../node_modules/mathbox/build/mathbox-bundle.js',
        to: 'mathbox-bundle.min.js' }
    ])
  ]
};
