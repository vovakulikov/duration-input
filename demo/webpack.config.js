const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const babelConfig = require('./babel.config');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: {
    vendor: ['react', 'react-dom'],
    app: path.resolve(__dirname, './src/index.tsx'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'), // Note: Physical files are only output by the production build task `npm run build`.
    publicPath: '/',
    filename: '[name].bundle.js'
  },
  target: 'web', // necessary per https://webpack.github.io/docs/testing.html#compile-and-test
  devtool: 'source-map',
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx",],
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: [{
          loader: "babel-loader",
          options: {
            ...babelConfig
          }
        }],
      },
      {
        test: /\.(scss)$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              modules: {
                localIdentName: '[local]--[hash:base64:5]',
              },
              localsConvention: 'camelCase',
            },
          },
          'sass-loader'
        ],
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: './demo/index.html',
      filename: "index.html"
    }),
  ].filter(Boolean),
};
