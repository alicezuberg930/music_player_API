import * as React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Slot } from './slot';
import type {
  PressableRef,
  SlottablePressableProps,
  SlottableTextProps,
  SlottableViewProps,
  TextRef,
  ViewRef,
} from './types';

const PrimitiveView = React.forwardRef<ViewRef, SlottableViewProps>(
  ({ asChild, ...props }, ref) => {
    const Component = asChild ? Slot : View;
    return <Component ref={ref} {...props} />;
  },
);

const PrimitiveText = React.forwardRef<TextRef, SlottableTextProps>(
  ({ asChild, ...props }, ref) => {
    const Component = asChild ? Slot : Text;
    return <Component ref={ref} {...props} />;
  },
);

const PrimitivePressable = React.forwardRef<
  PressableRef,
  SlottablePressableProps
>(({ asChild, ...props }, ref) => {
  const Component = asChild ? Slot : Pressable;
  return <Component ref={ref} {...props} />;
});

PrimitiveView.displayName = 'PrimitiveView';
PrimitiveText.displayName = 'PrimitiveText';
PrimitivePressable.displayName = 'PrimitivePressable';

export { PrimitivePressable, PrimitiveText, PrimitiveView };
