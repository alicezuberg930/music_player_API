import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { PrimitivePressable, PrimitiveView } from './primitive';
import type {
  PressableRef,
  SlottablePressableProps,
  SlottableViewProps,
  ViewRef,
} from './types';

type SingleRootProps = {
  onValueChange: (value: string | undefined) => void;
  type: 'single';
  value: string | undefined;
};

type MultipleRootProps = {
  onValueChange: (value: string[]) => void;
  type: 'multiple';
  value: string[];
};

type RootProps = (SingleRootProps | MultipleRootProps) &
  SlottableViewProps & {
    dir?: 'ltr' | 'rtl';
    disabled?: boolean;
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical';
    rovingFocus?: boolean;
  };

type RootContextValue = {
  disabled: boolean;
  onItemPress: (itemValue: string) => void;
  value: string | string[] | undefined;
};

const RootContext = React.createContext<RootContextValue | null>(null);

function useRootContext() {
  const context = React.useContext(RootContext);
  if (!context) {
    throw new Error(
      'ToggleGroup compound components must be rendered inside ToggleGroup.Root',
    );
  }
  return context;
}

function getIsSelected(
  value: string | string[] | undefined,
  itemValue: string,
) {
  return Array.isArray(value) ? value.includes(itemValue) : value === itemValue;
}

const Root = React.forwardRef<ViewRef, RootProps>(
  (
    {
      dir: _dir,
      disabled = false,
      loop: _loop,
      onValueChange,
      orientation: _orientation,
      rovingFocus: _rovingFocus,
      type,
      value,
      ...props
    },
    ref,
  ) => {
    const onItemPress = React.useCallback(
      (itemValue: string) => {
        if (type === 'single') {
          onValueChange(value === itemValue ? undefined : itemValue);
          return;
        }

        onValueChange(
          value.includes(itemValue)
            ? value.filter(currentValue => currentValue !== itemValue)
            : [...value, itemValue],
        );
      },
      [onValueChange, type, value],
    );
    const contextValue = React.useMemo(
      () => ({ disabled, onItemPress, value }),
      [disabled, onItemPress, value],
    );

    return (
      <RootContext.Provider value={contextValue}>
        <PrimitiveView ref={ref} accessibilityRole="toolbar" {...props} />
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
    const selected = getIsSelected(root.value, value);
    const isDisabled = Boolean(disabled || root.disabled);

    function handlePress(event: GestureResponderEvent) {
      onPress?.(event);
      if (!isDisabled && !event.isDefaultPrevented()) {
        root.onItemPress(value);
      }
    }

    return (
      <PrimitivePressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, selected }}
        disabled={isDisabled}
        onPress={handlePress}
        {...props}
      />
    );
  },
);

Root.displayName = 'ToggleGroupRoot';
Item.displayName = 'ToggleGroupItem';

const utils = { getIsSelected };

export { Item, Root, useRootContext, utils };
export type { ItemProps, RootProps };
