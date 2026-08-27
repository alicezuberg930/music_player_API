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
  onValueChange: (value: string) => void;
  value: string;
};

const RootContext = React.createContext<RootContextValue | null>(null);

function useRootContext() {
  const context = React.useContext(RootContext);
  if (!context) {
    throw new Error(
      'Tabs compound components must be rendered inside Tabs.Root',
    );
  }
  return context;
}

type RootProps = SlottableViewProps & {
  activationMode?: 'automatic' | 'manual';
  dir?: 'ltr' | 'rtl';
  onValueChange: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  value: string;
};

const Root = React.forwardRef<ViewRef, RootProps>(
  (
    {
      activationMode: _activationMode,
      dir: _dir,
      onValueChange,
      orientation: _orientation,
      value,
      ...props
    },
    ref,
  ) => {
    const contextValue = React.useMemo(
      () => ({ onValueChange, value }),
      [onValueChange, value],
    );
    return (
      <RootContext.Provider value={contextValue}>
        <PrimitiveView ref={ref} {...props} />
      </RootContext.Provider>
    );
  },
);

type ListProps = SlottableViewProps;
const List = React.forwardRef<ViewRef, ListProps>((props, ref) => (
  <PrimitiveView ref={ref} accessibilityRole="tablist" {...props} />
));

type TriggerProps = SlottablePressableProps & {
  value: string;
};
const Trigger = React.forwardRef<PressableRef, TriggerProps>(
  ({ disabled, onPress, value, ...props }, ref) => {
    const root = useRootContext();
    const selected = root.value === value;

    function handlePress(event: GestureResponderEvent) {
      onPress?.(event);
      if (!disabled && !event.isDefaultPrevented()) {
        root.onValueChange(value);
      }
    }

    return (
      <PrimitivePressable
        ref={ref}
        accessibilityRole="tab"
        accessibilityState={{ disabled: Boolean(disabled), selected }}
        disabled={disabled}
        onPress={handlePress}
        {...props}
      />
    );
  },
);

type ContentProps = SlottableViewProps &
  ForceMountable & {
    value: string;
  };
const Content = React.forwardRef<ViewRef, ContentProps>(
  ({ forceMount, value, ...props }, ref) => {
    const root = useRootContext();
    if (!forceMount && root.value !== value) {
      return null;
    }
    return <PrimitiveView ref={ref} accessibilityRole="tabpanel" {...props} />;
  },
);

Root.displayName = 'TabsRoot';
List.displayName = 'TabsList';
Trigger.displayName = 'TabsTrigger';
Content.displayName = 'TabsContent';

export { Content, List, Root, Trigger, useRootContext };
export type { ContentProps, ListProps, RootProps, TriggerProps };
