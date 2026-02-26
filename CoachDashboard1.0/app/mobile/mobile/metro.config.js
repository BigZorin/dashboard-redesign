const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch shared packages (e.g. @evotion/auth)
config.watchFolders = [
  path.resolve(monorepoRoot, 'packages'),
];

// Resolve from mobile node_modules first, then root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Follow pnpm symlinks properly
config.resolver.unstable_enableSymlinks = true;

// Block web app and rag app from being resolved
config.resolver.blockList = [
  /apps[\/\\]web[\/\\].*/,
  /apps[\/\\]rag[\/\\].*/,
  /node_modules[\/\\]react-dom[\/\\].*/,
];

module.exports = config;
