module.exports = () => ({
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg|svgz)(\?.+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              outputPath: 'images/',
              name: '[name].[ext]',
              limit: 64,
            },
          },
        ],
      },
      {
        test: /\.(eot|ttf|woff|woff2|otf)(\?.+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              outputPath: 'fonts/',
              name: '[name].[ext]',
              limit: 64,
            },
          },
        ],
      },
    ],
  },
});
