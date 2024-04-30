const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const slsw = require('serverless-webpack');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  entry: slsw.lib.entries,
  experiments: {
    outputModule: true,
  },
  target: 'node',
  mode: slsw.isLocal ? 'development' : 'production',
  performance: {
    hints: false,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'ts-loader'],
      },
    ]
  },
  node: false,
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        keep_classnames: true,
        keep_fnames: true,
      }
    }
    )],
  },
  resolve: {
    extensions: ['.cjs', '.mjs', '.js', '.ts'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, 'tsconfig.json'),
      }),
    ]
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
  ],
  output: {
    path: slsw.lib.webpack.isLocal ? path.join(__dirname, '.webpack') : path.join(__dirname, 'dist'),
    chunkFormat: 'module',
    library: {
      type: "module",
    },
  },
};
