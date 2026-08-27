const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const sourceRoot = path.resolve(__dirname, 'src');
const workspaceRoot = path.resolve(__dirname, '../..');

function resolveAlias(moduleName) {
  if (!moduleName.startsWith('@/')) {
    return moduleName;
  }

  return path.resolve(sourceRoot, moduleName.slice(2));
}

const config = {
  watchFolders: [workspaceRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    resolveRequest: (context, moduleName, platform) => {
      return context.resolveRequest(
        context,
        resolveAlias(moduleName),
        platform,
      );
    },
  },
};

module.exports = withNativeWind(
  mergeConfig(getDefaultConfig(__dirname), config),
  { input: './global.css' },
);
