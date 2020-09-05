module.exports = {
  "plugins": [
    "react-hot-loader/babel",
    ["@babel/plugin-proposal-decorators", { "legacy" : true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }],
  ],
  "presets": [
    "@babel/preset-env",
    "@babel/preset-typescript",
    "@babel/preset-react",
  ],
};
