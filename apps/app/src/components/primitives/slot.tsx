import * as React from 'react';
import type {
  PressableStateCallbackType,
  StyleProp,
  ViewStyle,
} from 'react-native';

type SlotProps = Record<string, unknown> & {
  children?: React.ReactNode;
};

type EventHandler = (...args: unknown[]) => unknown;
type StyleValue =
  | StyleProp<ViewStyle>
  | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T | null) => {
    refs.forEach(ref => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref) {
        ref.current = value;
      }
    });
  };
}

function mergeStyles(
  slotStyle: StyleValue | undefined,
  childStyle: StyleValue | undefined,
) {
  if (typeof slotStyle === 'function' || typeof childStyle === 'function') {
    return (state: PressableStateCallbackType) => [
      typeof slotStyle === 'function' ? slotStyle(state) : slotStyle,
      typeof childStyle === 'function' ? childStyle(state) : childStyle,
    ];
  }

  return [slotStyle, childStyle];
}

function mergeProps(slotProps: SlotProps, childProps: SlotProps) {
  const mergedProps: SlotProps = { ...slotProps, ...childProps };

  Object.keys(slotProps).forEach(key => {
    const slotValue = slotProps[key];
    const childValue = childProps[key];

    if (
      /^on[A-Z]/.test(key) &&
      typeof slotValue === 'function' &&
      typeof childValue === 'function'
    ) {
      mergedProps[key] = (...args: unknown[]) => {
        (childValue as EventHandler)(...args);
        const event = args[0] as { defaultPrevented?: boolean } | undefined;
        if (!event?.defaultPrevented) {
          (slotValue as EventHandler)(...args);
        }
      };
    }
  });

  const className = [slotProps.className, childProps.className]
    .filter(Boolean)
    .join(' ');
  if (className) {
    mergedProps.className = className;
  }

  if (slotProps.style || childProps.style) {
    mergedProps.style = mergeStyles(
      slotProps.style as StyleValue | undefined,
      childProps.style as StyleValue | undefined,
    );
  }

  return mergedProps;
}

const Slot = React.forwardRef<unknown, SlotProps>(
  ({ children, ...slotProps }, forwardedRef) => {
    if (!React.isValidElement(children)) {
      return null;
    }

    const child = children as React.ReactElement<SlotProps>;
    const childRef = child.props.ref as React.Ref<unknown> | undefined;

    return React.cloneElement(child, {
      ...mergeProps(slotProps, child.props),
      ref: composeRefs(forwardedRef, childRef),
    });
  },
);

Slot.displayName = 'Slot';

export { Slot };
