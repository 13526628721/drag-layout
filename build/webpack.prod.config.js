const path = require("path");
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");  //将css解压到单独的文件中
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");  //压缩css，优化css结构

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const srcRoot = path.resolve(__dirname, "../src/components");
const buildPath = path.join(__dirname, "../module/dist");

const assetsPath = function(_path) {
  const assetsSubDirectory = ''
  return path.posix.join(assetsSubDirectory, _path);
};


module.exports = {
  mode: "development",
  entry: {
    "index": path.join(__dirname, "../src/cron/index.js")
  },
  output: {
    path: buildPath,
    library: "YQ_system",
    libraryTarget: "umd",
    umdNamedDefine: true,
    filename: "index.js",
    publicPath: '/',
    // libraryExport: "default",

  },
  resolve: {
    extensions: [".js", ".jsx",'.css','.less'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader"
          }
        ],
        // include: srcRoot
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
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin({
        cssProcessor: require("cssnano"),
        cssProcessorOptions: { discardComments: { removeAll: true } }, // 移除所有注释
        canPrint: true // 是否向控制台打印消息
      }),
      new UglifyJsPlugin()
    ],
    noEmitOnErrors: true,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].min.css" // 提取后的css的文件名
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // new BundleAnalyzerPlugin(),
  ],
  externals: {
    react: {
      root: "React",
      commonjs2: "react",
      commonjs: "react",
      amd: "react"
    },
    "react-dom": {
      root: "ReactDOM",
      commonjs2: "react-dom",
      commonjs: "react-dom",
      amd: "react-dom"
    },
    "antd":"antd",
  }
};