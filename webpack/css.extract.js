const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (paths) => ({
  module: {
    rules: [

      {
        test: /\.(scss|css|sass)$/,
        include: paths,
        use: [
          // { loader: MiniCssExtractPlugin.loader },
          
          { 
            loader: 'style-loader',
            options: {
              insertAt: 'top',
              singleton: true,
            }
          },

          { loader: 'css-loader' },
          // { loader: 'postcss-loader' },
          { loader: 'sass-loader' },
        ]
      },

      {
        test: /\.(less)$/,
        include: paths,
        use: [
          //MiniCssExtractPlugin.loader,
          { 
            loader: 'style-loader',
            options: {
              insertAt: 'top',
            }
          },

          { loader: 'css-loader' },
          // { loader: 'postcss-loader' },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
            }
          },
          
        ]
      }
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),

    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorPluginOptions: {
        preset: ['default', { discardComments: { removeAll: true } }],
      },
      canPrint: true,
    }),
  ],
});
