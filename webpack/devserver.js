const pathResolve = require('path').resolve;
const url = require('url');
const publicPath = '/kholobok-biz/';

module.exports = () => ({
  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true,
    port: 8030,
    open: true,
    historyApiFallback: {
      index: url.parse(publicPath).pathname,
    },
    contentBase: pathResolve('./src/assets'),
    watchContentBase: true,
    watchOptions: {
      ignored: /node_modules/,
    },
  },
});
