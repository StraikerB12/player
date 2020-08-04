const webpack = require('webpack');
const path = require('path');
const publicPath = 'kholobok-biz';

const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = () => ({
  output: {
    path: path.resolve(__dirname, `../${publicPath}`),
    filename: '[name].js',
    publicPath: `/${publicPath}/`,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src') + '/index.html',
      filename: 'index.html',
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
});
