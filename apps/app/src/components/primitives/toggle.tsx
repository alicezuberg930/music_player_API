import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { PrimitivePressable } from './primitive';
import type { PressableRef, SlottablePressableProps } from './types';

type RootProps = SlottablePressableProps & {
  disabled?: boolean;
  onPressedChange: (pressed: boolean) => void;
  pressed: boolean;
};

const Root = React.forwardRef<PressableRef, RootProps>(
  ({ disabled, onPress, onPressedChange, pressed, ...props }, ref) => {
    function handlePress(event: GestureResponderEvent) {
      onPress?.(event);
      if (!disabled && !event.isDefaultPrevented()) {
        onPressedChange(!pressed);
      }
    }

    return (
      <PrimitivePressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled: Boolean(disabled), selected: pressed }}
        disabled={disabled}
        onPress={handlePress}
        {...props}
      />
    );
  },
);

Root.displayName = 'ToggleRoot';

export { Root };
export type { RootProps };
