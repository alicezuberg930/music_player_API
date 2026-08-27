import * as React from 'react';
import { AccessibilityInfo, BackHandler, findNodeHandle } from 'react-native';

type ControllableStateProps<T> = {
  defaultProp?: T;
  onChange?: (value: T) => void;
  prop?: T;
};

function useControllableState<T>({
  defaultProp,
  onChange,
  prop,
}: ControllableStateProps<T>) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultProp);
  const controlled = prop !== undefined;
  const value = controlled ? prop : uncontrolledValue;

  const setValue = React.useCallback(
    (nextValue: React.SetStateAction<T | undefined>) => {
      const resolvedValue =
        typeof nextValue === 'function'
          ? (nextValue as (previousValue: T | undefined) => T | undefined)(
              value,
            )
          : nextValue;

      if (Object.is(value, resolvedValue)) {
        return;
      }

      if (!controlled) {
        setUncontrolledValue(resolvedValue);
      }

      onChange?.(resolvedValue as T);
    },
    [controlled, onChange, value],
  );

  return [value, setValue] as const;
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  if (ref) {
    ref.current = value;
  }
}

function useComposedRefs<T>(
  firstRef: React.Ref<T> | undefined,
  secondRef: React.Ref<T> | undefined,
) {
  return React.useCallback(
    (value: T | null) => {
      setRef(firstRef, value);
      setRef(secondRef, value);
    },
    [firstRef, secondRef],
  );
}

function useBackHandler(enabled: boolean, onBack: () => void) {
  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onBack();
        return true;
      },
    );

    return () => subscription.remove();
  }, [enabled, onBack]);
}

function useFocusOnOpen<T>(open: boolean, ref: React.RefObject<T | null>) {
  React.useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = setTimeout(() => {
      const handle = findNodeHandle(ref.current);
      if (handle != null) {
        AccessibilityInfo.setAccessibilityFocus(handle);
      }
    }, 50);

    return () => clearTimeout(timeout);
  }, [open, ref]);
}

function useRestoreFocus<T>(open: boolean, ref: React.RefObject<T | null>) {
  const wasOpen = React.useRef(open);

  React.useEffect(() => {
    if (wasOpen.current && !open) {
      const timeout = setTimeout(() => {
        const handle = findNodeHandle(ref.current);
        if (handle != null) {
          AccessibilityInfo.setAccessibilityFocus(handle);
        }
      }, 50);

      wasOpen.current = open;
      return () => clearTimeout(timeout);
    }

    wasOpen.current = open;
  }, [open, ref]);
}

export {
  useBackHandler,
  useComposedRefs,
  useControllableState,
  useFocusOnOpen,
  useRestoreFocus,
};
