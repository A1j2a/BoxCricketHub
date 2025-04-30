module.exports = {
  presets: ["babel-preset-expo"],
  plugins: [
    // Expo Router plugin for routing support
    require.resolve("expo-router/babel"),

    // Your existing Babel plugins
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    ["@babel/plugin-proposal-class-properties", { loose: true }],
    "@babel/plugin-transform-flow-strip-types",
  ],
};
