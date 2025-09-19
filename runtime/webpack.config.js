const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const appDirectory = path.resolve(__dirname);
const babelConfig = require(`${appDirectory}/babel.config`);

const BabelLoader = {
  test: /\.(js|jsx|ts|tsx)$/,
  exclude: {
    and: [
      // babel will exclude these from transpling
      path.resolve(appDirectory, "node_modules"),
      path.resolve(appDirectory, "ios"),
      path.resolve(appDirectory, "android"),
    ],
    // whitelisted modules to be transpiled by babel
    not: [],
  },
  include: [
    path.resolve(appDirectory, "index.web.js"),
    path.resolve(appDirectory, "src"),
    path.resolve(appDirectory, "App.tsx"),
  ],
  use: {
    loader: "babel-loader",
    options: {
      presets: babelConfig.presets,
      plugins: babelConfig.plugins,
    },
  },
};

const AssetsLoader = { test: /.(png|jpe?g|gif|svg)$/, type: "asset/resource" };

const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: path.resolve(appDirectory, "./public/index.html"),
});

module.exports = {
  entry: path.resolve(__dirname, "index.web.js"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[id].bundle.js",
    asyncChunks: true,
  },
  resolve: {
    extensions: [
      ".web.ts",
      ".web.tsx",
      ".web.js",
      ".web.jsx",
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ".json",
    ],
    alias: { "react-native$": "react-native-web" },
  },
  module: { rules: [BabelLoader, AssetsLoader] },
  plugins: [HtmlWebpackPluginConfig],
};
