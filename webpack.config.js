'use strict';

var webpack = require('webpack');

var env = process.env.NODE_ENV;

var config = {
  output: {
    library: 'ReactDivider',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      { test: /\.jsx$/, loader: 'babel', exclude: /node_modules/, query: { presets: ['es2015', 'react'] }}
    ]
  },
  externals: [
    {
      'react': {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react'
      },
      'react-dom': {
        root: 'ReactDOM',
        commonjs2: 'react-dom',
        commonjs: 'react-dom',
        amd: 'react-dom'
      },
      'classnames/dedupe': {
        root: 'classnames',
        commonjs2: 'classnames',
        commonjs: 'classnames',
        amd: 'classnames'
      }
    }
  ],
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env)
    })
  ]
};

if (env === 'production') {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true
      }
    })
  );
}

module.exports = config;
