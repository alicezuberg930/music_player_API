import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { PrimitivePressable, PrimitiveView } from './primitive';
import type {
  PressableRef,
  SlottablePressableProps,
  SlottableViewProps,
  ViewRef,
} from './types';

type RootProps = SlottablePressableProps & {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

const Root = React.forwardRef<PressableRef, RootProps>(
  ({ checked, disabled, onCheckedChange, onPress, ...props }, ref) => {
    function handlePress(event: GestureResponderEvent) {
      onPress?.(event);
      if (!disabled && !event.isDefaultPrevented()) {
        onCheckedChange(!checked);
      }
    }

    return (
      <PrimitivePressable
        ref={ref}
        accessibilityRole="switch"
        accessibilityState={{ checked, disabled: Boolean(disabled) }}
        disabled={disabled}
        onPress={handlePress}
        {...props}
      />
    );
  },
);

type ThumbProps = SlottableViewProps;
const Thumb = React.forwardRef<ViewRef, ThumbProps>((props, ref) => (
  <PrimitiveView ref={ref} {...props} />
));

Root.displayName = 'SwitchRoot';
Thumb.displayName = 'SwitchThumb';

export { Root, Thumb };
export type { RootProps, ThumbProps };
