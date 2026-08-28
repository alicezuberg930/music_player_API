import { Portal } from '@/components/primitives/portal';
import * as ToastPrimitive from '@/components/primitives/toast';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import {
  selectToasts,
  toastAdded,
  toastConfigUpdated,
  toastDismissed,
  toastUpdated,
  type ToastItem,
  type ToastType,
} from '@/redux/slices/toast';
import { store, useAppSelector } from '@/redux/store';
import { nanoid } from '@reduxjs/toolkit';
import { AlertTriangle, Check, Info, X } from 'lucide-react-native';
import * as React from 'react';
import { useWindowDimensions, View, type ViewStyle } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  LinearTransition,
  ReduceMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

type ToastActionOptions = {
  label: string;
  onPress: () => void;
};

type ToastOptions = {
  action?: ToastActionOptions;
  description?: string;
  duration?: number;
};

type ToastCreateData = ToastOptions & {
  title: string;
  type: ToastType;
};

type ToastUpdateData = Partial<Omit<ToastItem, 'action' | 'id'>> & {
  action?: ToastActionOptions;
};

type ToastPromiseMessages = {
  error: string;
  loading: string;
  success: string;
};

type ToastFunction = {
  (title: string, options?: ToastOptions): string;
  dismiss: (id: string) => void;
  error: (title: string, options?: ToastOptions) => string;
  info: (title: string, options?: ToastOptions) => string;
  promise: <T>(
    promise: Promise<T>,
    messages: ToastPromiseMessages,
    options?: ToastOptions,
  ) => Promise<T>;
  success: (title: string, options?: ToastOptions) => string;
  warning: (title: string, options?: ToastOptions) => string;
};

type ToasterProps = {
  duration?: number;
  limit?: number;
  position?: ToastPosition;
};

const toastTimers = new Map<string, ReturnType<typeof setTimeout>>();
const toastActions = new Map<string, () => void>();

function normalizeDuration(duration: number | undefined, fallback: number) {
  if (duration === undefined) {
    return fallback;
  }
  if (duration === Infinity) {
    return Infinity;
  }
  return Number.isFinite(duration) ? Math.max(0, duration) : fallback;
}

function normalizeLimit(limit: number) {
  return Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 1;
}

function clearToastResources(id: string) {
  const timer = toastTimers.get(id);
  if (timer !== undefined) {
    clearTimeout(timer);
  }
  toastTimers.delete(id);
  toastActions.delete(id);
}

function dismissToast(id: string) {
  clearToastResources(id);
  store.dispatch(toastDismissed(id));
}

function scheduleDismiss(id: string, duration: number) {
  if (duration === Infinity) {
    return;
  }

  const timer = setTimeout(() => {
    toastTimers.delete(id);
    dismissToast(id);
  }, duration);
  toastTimers.set(id, timer);
}

function addToast(data: ToastCreateData) {
  const state = store.getState().toast;
  const limit = normalizeLimit(state.config.limit);
  const excess = state.toasts.length - limit + 1;

  if (excess > 0) {
    state.toasts.slice(0, excess).forEach(item => dismissToast(item.id));
  }

  const id = nanoid();
  const duration = normalizeDuration(data.duration, state.config.duration);
  const item: ToastItem = {
    id,
    title: data.title,
    description: data.description,
    type: data.type,
    duration,
    action: data.action ? { label: data.action.label } : undefined,
  };

  if (data.action) {
    toastActions.set(id, data.action.onPress);
  }

  store.dispatch(toastAdded(item));
  scheduleDismiss(id, duration);

  return id;
}

function updateToast(id: string, data: ToastUpdateData) {
  const current = store.getState().toast.toasts.find(item => item.id === id);
  if (!current) {
    return;
  }

  const { action, ...dataWithoutAction } = data;
  const serializableData: Partial<Omit<ToastItem, 'id'>> = dataWithoutAction;

  if (Object.prototype.hasOwnProperty.call(data, 'action')) {
    serializableData.action = action ? { label: action.label } : undefined;
    if (action) {
      toastActions.set(id, action.onPress);
    } else {
      toastActions.delete(id);
    }
  }

  if (data.duration !== undefined) {
    const duration = normalizeDuration(
      data.duration,
      store.getState().toast.config.duration,
    );
    serializableData.duration = duration;
    const timer = toastTimers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    toastTimers.delete(id);
    store.dispatch(toastUpdated({ id, data: serializableData }));
    scheduleDismiss(id, duration);
    return;
  }

  store.dispatch(toastUpdated({ id, data: serializableData }));
}

function configureToast(limit: number, duration: number) {
  const state = store.getState().toast;
  const config = {
    duration: normalizeDuration(duration, state.config.duration),
    limit: normalizeLimit(limit),
  };

  store.dispatch(toastConfigUpdated(config));

  const excess = state.toasts.length - config.limit;
  if (excess > 0) {
    state.toasts.slice(0, excess).forEach(item => dismissToast(item.id));
  }
}

const toast = ((title: string, options?: ToastOptions) =>
  addToast({ title, type: 'default', ...options })) as ToastFunction;

toast.success = (title, options) =>
  addToast({ title, type: 'success', ...options });

toast.error = (title, options) =>
  addToast({ title, type: 'error', ...options });

toast.info = (title, options) => addToast({ title, type: 'info', ...options });

toast.warning = (title, options) =>
  addToast({ title, type: 'warning', ...options });

toast.promise = (promise, messages, options) => {
  const id = addToast({
    title: messages.loading,
    ...options,
    type: 'default',
    duration: Infinity,
  });

  return promise.then(
    result => {
      updateToast(id, {
        title: messages.success,
        type: 'success',
        duration: store.getState().toast.config.duration,
      });
      return result;
    },
    error => {
      updateToast(id, {
        title: messages.error,
        type: 'error',
        duration: store.getState().toast.config.duration,
      });
      throw error;
    },
  );
};

toast.dismiss = dismissToast;

function getPositionStyle(
  position: ToastPosition,
  insets: { bottom: number; top: number },
  windowWidth: number,
): ViewStyle {
  const sideWidth = Math.min(320, Math.max(0, windowWidth - 32));

  switch (position) {
    case 'top-left':
      return { top: insets.top + 10, left: 16, width: sideWidth };
    case 'top-center':
      return { top: insets.top + 10, left: 16, right: 16 };
    case 'top-right':
      return { top: insets.top + 10, right: 16, width: sideWidth };
    case 'bottom-left':
      return { bottom: insets.bottom + 10, left: 16, width: sideWidth };
    case 'bottom-center':
      return { bottom: insets.bottom + 10, left: 16, right: 16 };
    case 'bottom-right':
      return { bottom: insets.bottom + 10, right: 16, width: sideWidth };
  }
}

function getTypeStyles(type: ToastType) {
  switch (type) {
    case 'success':
      return 'border-l-green-500';
    case 'error':
      return 'border-l-red-500';
    case 'warning':
      return 'border-l-amber-500';
    case 'info':
      return 'border-l-blue-500';
    default:
      return 'border-l-primary/50';
  }
}

const LAYOUT_ANIMATION = LinearTransition.springify()
  .damping(30)
  .mass(0.8)
  .stiffness(200)
  .reduceMotion(ReduceMotion.System);
const ENTER_ANIMATION_DOWN = FadeInDown.springify()
  .damping(30)
  .mass(0.8)
  .stiffness(200)
  .reduceMotion(ReduceMotion.System);
const ENTER_ANIMATION_UP = FadeInUp.springify()
  .damping(30)
  .mass(0.8)
  .stiffness(200)
  .reduceMotion(ReduceMotion.System);
const EXIT_ANIMATION_DOWN = FadeOutDown.springify()
  .damping(30)
  .mass(0.8)
  .stiffness(200)
  .reduceMotion(ReduceMotion.System);
const EXIT_ANIMATION_UP = FadeOutUp.springify()
  .damping(30)
  .mass(0.8)
  .stiffness(200)
  .reduceMotion(ReduceMotion.System);

function ToastIcon({ type }: { type: ToastType }) {
  if (type === 'success') {
    return (
      <Icon as={Check} className="text-green-500" size={20} strokeWidth={1.5} />
    );
  }
  if (type === 'error') {
    return (
      <Icon
        as={AlertTriangle}
        className="text-destructive"
        size={20}
        strokeWidth={1.5}
      />
    );
  }
  if (type === 'warning') {
    return (
      <Icon
        as={AlertTriangle}
        className="text-amber-500"
        size={20}
        strokeWidth={1.5}
      />
    );
  }
  if (type === 'info') {
    return (
      <Icon as={Info} className="text-blue-500" size={20} strokeWidth={1.5} />
    );
  }
  return <Icon as={Info} size={20} strokeWidth={1.5} />;
}

function Toaster({
  position = 'top-center',
  limit = 3,
  duration = 4000,
}: ToasterProps) {
  const toasts = useAppSelector(selectToasts);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  React.useEffect(() => {
    configureToast(limit, duration);
  }, [duration, limit]);

  if (toasts.length === 0) {
    return null;
  }

  const isBottom = position.startsWith('bottom');
  const sortedToasts = [...toasts].reverse();

  return (
    <Portal name="toast-portal">
      <View
        pointerEvents="box-none"
        className={cn(
          'absolute z-50 gap-2',
          isBottom ? 'flex-col-reverse' : 'flex-col',
        )}
        style={getPositionStyle(position, insets, width)}
      >
        {sortedToasts.map(item => {
          const action = item.action ? toastActions.get(item.id) : undefined;

          return (
            <Animated.View
              key={item.id}
              layout={LAYOUT_ANIMATION}
              entering={isBottom ? ENTER_ANIMATION_UP : ENTER_ANIMATION_DOWN}
              exiting={isBottom ? EXIT_ANIMATION_UP : EXIT_ANIMATION_DOWN}
            >
              <ToastPrimitive.Root
                open
                onOpenChange={open => {
                  if (!open) dismissToast(item.id);
                }}
                className={cn(
                  'flex-row items-center justify-between rounded-xl border border-l-4 border-border bg-background p-4 shadow-xl shadow-foreground/5',
                  getTypeStyles(item.type),
                )}
              >
                <View className="flex-1 flex-row items-center gap-3">
                  <ToastIcon type={item.type} />
                  <View className="flex-1 gap-1">
                    <ToastPrimitive.Title className="text-sm font-semibold text-foreground">
                      {item.title}
                    </ToastPrimitive.Title>
                    {item.description ? (
                      <ToastPrimitive.Description className="text-sm text-muted-foreground">
                        {item.description}
                      </ToastPrimitive.Description>
                    ) : null}
                  </View>
                </View>

                {item.action ? (
                  <ToastPrimitive.Action
                    className="ml-3 rounded bg-primary px-3 py-1.5"
                    onPress={action}
                  >
                    <Text className="text-xs font-semibold text-primary-foreground">
                      {item.action.label}
                    </Text>
                  </ToastPrimitive.Action>
                ) : (
                  <ToastPrimitive.Close
                    accessibilityLabel="Close notification"
                    className="rounded-full p-1 active:bg-secondary"
                  >
                    <Icon as={X} size={20} strokeWidth={1.5} />
                  </ToastPrimitive.Close>
                )}
              </ToastPrimitive.Root>
            </Animated.View>
          );
        })}
      </View>
    </Portal>
  );
}

export { toast, Toaster };
export type {
  ToastActionOptions,
  ToastOptions,
  ToastPosition,
  ToastPromiseMessages,
  ToasterProps,
};
