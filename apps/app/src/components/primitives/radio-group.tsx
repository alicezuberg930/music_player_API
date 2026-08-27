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

type RootContextValue = {
  disabled: boolean;
  onValueChange: (value: string) => void;
  value: string | undefined;
};

type ItemContextValue = {
  checked: boolean;
};

const RootContext = React.createContext<RootContextValue | null>(null);
const ItemContext = React.createContext<ItemContextValue | null>(null);

function useRootContext() {
  const context = React.useContext(RootContext);
  if (!context) {
    throw new Error(
      'RadioGroup compound components must be rendered inside RadioGroup.Root',
    );
  }
  return context;
}

type RootProps = SlottableViewProps & {
  disabled?: boolean;
  onValueChange: (value: string) => void;
  value: string | undefined;
};

const Root = React.forwardRef<ViewRef, RootProps>(
  ({ disabled = false, onValueChange, value, ...props }, ref) => {
    const contextValue = React.useMemo(
      () => ({ disabled, onValueChange, value }),
      [disabled, onValueChange, value],
    );
    return (
      <RootContext.Provider value={contextValue}>
        <PrimitiveView ref={ref} accessibilityRole="radiogroup" {...props} />
      </RootContext.Provider>
    );
  },
);

type ItemProps = SlottablePressableProps & {
  value: string;
};

const Item = React.forwardRef<PressableRef, ItemProps>(
  ({ disabled, onPress, value, ...props }, ref) => {
    const root = useRootContext();
    const checked = root.value === value;
    const isDisabled = Boolean(disabled || root.disabled);

    function handlePress(event: GestureResponderEvent) {
      onPress?.(event);
      if (!isDisabled && !checked && !event.isDefaultPrevented()) {
        root.onValueChange(value);
      }
    }

    return (
      <ItemContext.Provider value={{ checked }}>
        <PrimitivePressable
          ref={ref}
          accessibilityRole="radio"
          accessibilityState={{ checked, disabled: isDisabled }}
          disabled={isDisabled}
          onPress={handlePress}
          {...props}
        />
      </ItemContext.Provider>
    );
  },
);

type IndicatorProps = SlottableViewProps & ForceMountable;
const Indicator = React.forwardRef<ViewRef, IndicatorProps>(
  ({ forceMount, ...props }, ref) => {
    const context = React.useContext(ItemContext);
    if (!context) {
      throw new Error(
        'RadioGroup.Indicator must be rendered inside RadioGroup.Item',
      );
    }
    if (!forceMount && !context.checked) {
      return null;
    }
    return <PrimitiveView ref={ref} {...props} />;
  },
);

Root.displayName = 'RadioGroupRoot';
Item.displayName = 'RadioGroupItem';
Indicator.displayName = 'RadioGroupIndicator';

export { Indicator, Item, Root, useRootContext };
export type { IndicatorProps, ItemProps, RootProps };
