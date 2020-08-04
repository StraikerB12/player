module.exports = () => ({
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg|svgz|eot|ttf|woff|woff2|otf)(\?.+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name].[ext]',
              limit: 64,
            },
          },
        ],
      },
    ],
  },
});
