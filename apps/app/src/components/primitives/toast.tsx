import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { useComposedRefs, useFocusOnOpen } from './hooks';
import { PrimitivePressable, PrimitiveText, PrimitiveView } from './primitive';
import type {
  PressableRef,
  SlottablePressableProps,
  SlottableTextProps,
  SlottableViewProps,
  TextRef,
  ViewRef,
} from './types';

type ToastPriority = 'foreground' | 'background';

type RootProps = SlottableViewProps & {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  type?: ToastPriority;
};

type ActionProps = SlottablePressableProps;
type CloseProps = SlottablePressableProps;
type DescriptionProps = SlottableTextProps;
type TitleProps = SlottableTextProps;

type ActionRef = PressableRef;
type CloseRef = PressableRef;
type DescriptionRef = TextRef;
type RootRef = ViewRef;
type TitleRef = TextRef;

type RootContextValue = Pick<RootProps, 'onOpenChange'>;

const RootContext = React.createContext<RootContextValue | null>(null);

function useRootContext() {
  const context = React.useContext(RootContext);
  if (!context) {
    throw new Error('Toast compound components must be rendered inside Root');
  }
  return context;
}

const Root = React.forwardRef<RootRef, RootProps>(
  ({ onOpenChange, open, type = 'foreground', ...props }, forwardedRef) => {
    const rootRef = React.useRef<RootRef>(null);
    const ref = useComposedRefs(forwardedRef, rootRef);
    useFocusOnOpen(open && type === 'foreground', rootRef);

    if (!open) {
      return null;
    }

    return (
      <RootContext.Provider value={{ onOpenChange }}>
        <PrimitiveView
          ref={ref}
          aria-live={type === 'foreground' ? 'assertive' : 'polite'}
          role={type === 'foreground' ? 'alert' : 'status'}
          {...props}
        />
      </RootContext.Provider>
    );
  },
);

const Action = React.forwardRef<ActionRef, ActionProps>(
  ({ disabled = false, onPress, ...props }, ref) => {
    const root = useRootContext();

    function handlePress(event: GestureResponderEvent) {
      if (disabled) {
        return;
      }
      root.onOpenChange(false);
      onPress?.(event);
    }

    return (
      <PrimitivePressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={handlePress}
        {...props}
      />
    );
  },
);

const Close = React.forwardRef<CloseRef, CloseProps>(
  ({ disabled = false, onPress, ...props }, ref) => {
    const root = useRootContext();

    function handlePress(event: GestureResponderEvent) {
      if (disabled) {
        return;
      }
      root.onOpenChange(false);
      onPress?.(event);
    }

    return (
      <PrimitivePressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={handlePress}
        {...props}
      />
    );
  },
);

const Title = React.forwardRef<TitleRef, TitleProps>((props, ref) => (
  <PrimitiveText ref={ref} role="heading" {...props} />
));

const Description = React.forwardRef<DescriptionRef, DescriptionProps>(
  (props, ref) => <PrimitiveText ref={ref} {...props} />,
);

Root.displayName = 'ToastRoot';
Action.displayName = 'ToastAction';
Close.displayName = 'ToastClose';
Description.displayName = 'ToastDescription';
Title.displayName = 'ToastTitle';

export { Action, Close, Description, Root, Title };
export type {
  ActionProps,
  ActionRef,
  CloseProps,
  CloseRef,
  DescriptionProps,
  DescriptionRef,
  RootProps,
  RootRef,
  TitleProps,
  TitleRef,
  ToastPriority,
};
