import * as React from 'react';
import { PrimitivePressable, PrimitiveText } from './primitive';
import type {
  PressableRef,
  SlottablePressableProps,
  SlottableTextProps,
  TextRef,
} from './types';

type RootProps = SlottablePressableProps;
type TextProps = SlottableTextProps & {
  htmlFor?: string;
};

const Root = React.forwardRef<PressableRef, RootProps>((props, ref) => (
  <PrimitivePressable ref={ref} accessibilityRole="text" {...props} />
));

const Text = React.forwardRef<TextRef, TextProps>(
  ({ htmlFor: _htmlFor, ...props }, ref) => (
    <PrimitiveText ref={ref} {...props} />
  ),
);

Root.displayName = 'LabelRoot';
Text.displayName = 'LabelText';

export { Root, Text };
export type { RootProps, TextProps };
