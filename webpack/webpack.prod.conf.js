const path = require('path');
const publicPath = 'player';
const TerserPlugin = require('terser-webpack-plugin');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

//${publicPath}/
module.exports = () => ({

  output: {
    path: path.resolve(__dirname, `../${publicPath}`),
    filename: 'js/index.js',
    publicPath: `/`,
  },

  plugins:[

    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src') + '/index.html',
      filename: 'newshow.blade.php',
      inlineSource: '.(js|css)$'
    }),
    new HtmlWebpackInlineSourcePlugin()
  ],

  optimization: {
    namedModules: true,
    concatenateModules: true,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        cache: false,
        sourceMap: false,
        parallel: true,
      }),
    ],
    // splitChunks: {
    //   chunks: 'all',
    // },
  },
});
