const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('cjs');

// This is the new line you should add in, after the previous lines
config.resolver.unstable_enablePackageExports = false;

module.exports = config;