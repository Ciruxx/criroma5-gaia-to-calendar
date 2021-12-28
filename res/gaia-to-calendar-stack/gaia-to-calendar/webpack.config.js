const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    index: "./bin/run.js",
  },
  target: "node",
  mode: "production",
  resolve: {
    extensions: [".js"],
  },
  externals: {
    "aws-sdk": "commonjs2 aws-sdk",
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "./lib/calendar/credentials.json", to: "credentials.json" },
        { from: "./lib/calendar/token.json", to: "token.json" },
      ],
    }),
  ],
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "build"),
    libraryTarget: "commonjs2",
  },
};
