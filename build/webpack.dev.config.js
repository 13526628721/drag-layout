const path = require('path');
const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");  //将css解压到单独的文件中
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");  //压缩css，优化css结构
const TerserWebpackPlugin = require('terser-webpack-plugin');
const assetsPath = function (_path) {
  const assetsSubDirectory = ''
  return path.posix.join(assetsSubDirectory, _path);
};
const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)
const config = {
  dev: {
    host: 'localhost', // can be overwritten by process.env.HOST
    port: 4000, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
  }
}
module.exports = {
  mode: 'development',
  entry: {
    index: path.join(__dirname, "../src/index.js")
  }, // 项目入口，处理资源文件的依赖关系
  output: {
    path: path.join(__dirname, "../dist/"),
    chunkFilename: '[id].chunk.js',
    publicPath: '',
    filename: '[name].[hash:8].js',
  },
  module: {
    rules: [
      {
        // 使用 babel-loader 来编译处理 js 和 jsx 文件
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "cache-loader",
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                require('autoprefixer')
              ]
            }
          }
        ]
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, '../dists/'),
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: true,
    hot: true,
    inline: true,
  },
  resolve: {
    extensions: [".js", ".jsx", '.css'],
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerPort: '3001'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, "../dist/index.html"),
      chunks: ['index'],
      template: path.resolve(__dirname, "../template/index.html"),
      minify: {
        removeComments: false, //删除注释评论
      }
    }),
    new MiniCssExtractPlugin({
      filename: "[name].min.css" // 提取后的css的文件名
    }),
  ]
}
