const path = require('path');
const reactNativePreset = require('@react-native/jest-preset');
const babelJest = require.resolve('babel-jest', {
  paths: [path.dirname(require.resolve('@react-native/jest-preset'))],
});

module.exports = {
  ...reactNativePreset,
  moduleNameMapper: {
    ...reactNativePreset.moduleNameMapper,
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react-native-reanimated$':
      '<rootDir>/__mocks__/react-native-reanimated.js',
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
  },
  transform: {
    ...reactNativePreset.transform,
    '^.+\\.(js|jsx|mjs|ts|tsx)$': babelJest,
  },
  transformIgnorePatterns: [],
};
