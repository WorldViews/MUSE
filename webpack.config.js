const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (env) => {
  const production = (env === 'prod' || env === 'analyze');
  const analyze = env === 'analyze';

  let config = {
    context: path.resolve(__dirname, './src'),
    devtool: "source-map",
    entry: {
      app: './app.js',
      nohApp: './nohApp.js',
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
      { three: 'THREE' },
      { mathbox: 'MathBox' },
    ],
    module: {
      rules: [
        {
          test: /\.exec\.js$/,
          use: ['script-loader']
        },
        {
          enforce: "pre",
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          loader: "eslint-loader",
          options: {
              extends: ["eslint:recommended", "google"],
              parser: "babel-eslint",
              fix: false,
              rules: {
                indent: [1, 4],
                "no-trailing-spaces": 1,
              }
          }
        },
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['es2015', 'stage-2', 'react']
            }
          }
        },
        {
            test: /\.scss$/,
            use: [{
                loader: "style-loader" // creates style nodes from JS strings
            }, {
                loader: "css-loader" // translates CSS into CommonJS
            }, {
                loader: "sass-loader" // compiles Sass to CSS
            }]
        }
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

  if (analyze) {
    config.plugins.push(new BundleAnalyzerPlugin());
  }

  return config;
}
