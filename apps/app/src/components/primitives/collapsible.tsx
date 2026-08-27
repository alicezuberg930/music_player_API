import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { useControllableState } from './hooks';
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
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

const RootContext = React.createContext<RootContextValue | null>(null);

function useRootContext() {
  const context = React.useContext(RootContext);
  if (!context) {
    throw new Error(
      'Collapsible compound components must be rendered inside Collapsible.Root',
    );
  }
  return context;
}

type RootProps = SlottableViewProps & {
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
};

const Root = React.forwardRef<ViewRef, RootProps>(
  (
    {
      defaultOpen = false,
      disabled = false,
      onOpenChange,
      open: openProp,
      ...props
    },
    ref,
  ) => {
    const [open = false, setOpen] = useControllableState({
      defaultProp: defaultOpen,
      onChange: onOpenChange,
      prop: openProp,
    });
    const value = React.useMemo(
      () => ({ disabled, onOpenChange: setOpen, open }),
      [disabled, open, setOpen],
    );

    return (
      <RootContext.Provider value={value}>
        <PrimitiveView ref={ref} {...props} />
      </RootContext.Provider>
    );
  },
);

type TriggerProps = SlottablePressableProps;
const Trigger = React.forwardRef<PressableRef, TriggerProps>(
  ({ disabled, onPress, ...props }, ref) => {
    const root = useRootContext();
    const isDisabled = Boolean(disabled || root.disabled);

    function handlePress(event: GestureResponderEvent) {
      onPress?.(event);
      if (!isDisabled && !event.isDefaultPrevented()) {
        root.onOpenChange(!root.open);
      }
    }

    return (
      <PrimitivePressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, expanded: root.open }}
        disabled={isDisabled}
        onPress={handlePress}
        {...props}
      />
    );
  },
);

type ContentProps = SlottableViewProps & ForceMountable;
const Content = React.forwardRef<ViewRef, ContentProps>(
  ({ forceMount, ...props }, ref) => {
    const { open } = useRootContext();
    if (!forceMount && !open) {
      return null;
    }
    return <PrimitiveView ref={ref} {...props} />;
  },
);

Root.displayName = 'CollapsibleRoot';
Trigger.displayName = 'CollapsibleTrigger';
Content.displayName = 'CollapsibleContent';

export { Content, Root, Trigger, useRootContext };
export type { ContentProps, RootProps, TriggerProps };
