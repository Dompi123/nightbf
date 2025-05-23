// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 1. Watch all files in the project
config.watchFolders = [path.resolve(__dirname)];

// 2. Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

// 3. Configure path aliases
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname, 'src'),
};

module.exports = config; 