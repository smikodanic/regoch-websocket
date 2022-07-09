/**
 * Run $ npx webpack --config client/webpack-client.config.js
 * from the project's root folder.
 */
const path = require('path');
const { ESBuildMinifyPlugin } = require('esbuild-loader');

module.exports = {
  mode: 'production',
  entry: {
    'client13jsonRWS': './src/Client13jsonRWS.js',
    'client13jsonRWS.min': './src/Client13jsonRWS.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist/client13jsonRWS'), // /web/node/regoch/regoch-weber/client
    filename: '[name].js',
    clean: true // remove content of the directory defined in the output.path
  },

  devtool: 'source-map',
  optimization: {
    minimizer: [
      new ESBuildMinifyPlugin({
        include: /\.min\.js$/,
        keepNames: true,
      }),
    ],
  },

  watch: true,
  watchOptions: {
    aggregateTimeout: 200,
    poll: 1000,
    ignored: ['node_modules']
  }
};
