const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add custom extensions (merge, don’t replace)
config.resolver.sourceExts.push("cjs");
config.resolver.assetExts.push("ico");

module.exports = config;
