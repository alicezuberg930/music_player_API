const React = require('react');
const { View } = require('react-native');

const animation = {};
for (const method of ['delay', 'duration', 'reduceMotion', 'springify', 'withInitialValues']) {
  animation[method] = () => animation;
}

const Animated = {
  View,
  createAnimatedComponent: (Component) => Component,
};

function LayoutAnimationConfig({ children }) {
  return React.createElement(React.Fragment, null, children);
}

function interpolate(value, input, output) {
  const start = input[0];
  const end = input[input.length - 1];
  const progress = end === start ? 0 : Math.min(Math.max((value - start) / (end - start), 0), 1);
  return output[0] + (output[output.length - 1] - output[0]) * progress;
}

module.exports = {
  __esModule: true,
  default: Animated,
  Extrapolation: { CLAMP: 'clamp' },
  FadeIn: animation,
  FadeInDown: animation,
  FadeInUp: animation,
  FadeOut: animation,
  FadeOutUp: animation,
  LayoutAnimationConfig,
  LinearTransition: animation,
  ReduceMotion: { System: 'system' },
  interpolate,
  useAnimatedStyle: (factory) => factory(),
  useDerivedValue: (factory) => ({ value: factory() }),
  withSpring: (value) => value,
  withTiming: (value) => value,
};
