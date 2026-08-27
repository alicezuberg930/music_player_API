import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { PrimitivePressable, PrimitiveView } from './primitive';
import type {
  ForceMountable,
  PressableRef,
  SlottablePressableProps,
  SlottableViewProps,
  ViewRef,
} from './types';

const CheckboxContext = React.createContext(false);

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
      <CheckboxContext.Provider value={checked}>
        <PrimitivePressable
          ref={ref}
          accessibilityRole="checkbox"
          accessibilityState={{ checked, disabled: Boolean(disabled) }}
          disabled={disabled}
          onPress={handlePress}
          {...props}
        />
      </CheckboxContext.Provider>
    );
  },
);

type IndicatorProps = SlottableViewProps & ForceMountable;

const Indicator = React.forwardRef<ViewRef, IndicatorProps>(
  ({ forceMount, ...props }, ref) => {
    const checked = React.useContext(CheckboxContext);
    if (!forceMount && !checked) {
      return null;
    }
    return <PrimitiveView ref={ref} {...props} />;
  },
);

Root.displayName = 'CheckboxRoot';
Indicator.displayName = 'CheckboxIndicator';

export { Indicator, Root };
export type { IndicatorProps, RootProps };
