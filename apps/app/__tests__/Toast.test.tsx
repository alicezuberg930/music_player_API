import { PortalHost } from '@/components/primitives/portal';
import { PrimitivePressable } from '@/components/primitives/primitive';
import { toast, Toaster } from '@/components/ui/toast';
import { toastConfigUpdated } from '@/redux/slices/toast';
import { store } from '@/redux/store';
import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Provider } from 'react-redux';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const TEST_WINDOW_METRICS = {
  frame: { height: 844, width: 390, x: 0, y: 0 },
  insets: { bottom: 0, left: 0, right: 0, top: 0 },
};

function resetToasts() {
  store.getState().toast.toasts.forEach(item => toast.dismiss(item.id));
  store.dispatch(toastConfigUpdated({ duration: 4000, limit: 3 }));
}

beforeEach(() => {
  jest.useFakeTimers();
  resetToasts();
});

afterEach(() => {
  resetToasts();
  jest.clearAllTimers();
  jest.useRealTimers();
});

test('keeps Redux state serializable and preserves toast variants', () => {
  const action = jest.fn();
  const id = toast.success('Playlist saved', {
    action: { label: 'Open', onPress: action },
    description: 'Night Drive is available offline.',
    duration: Infinity,
  });

  expect(store.getState().toast.toasts).toEqual([
    {
      action: { label: 'Open' },
      description: 'Night Drive is available offline.',
      duration: Infinity,
      id,
      title: 'Playlist saved',
      type: 'success',
    },
  ]);
  expect(JSON.stringify(store.getState().toast)).not.toContain('onPress');
});

test('supports zero and infinite durations', () => {
  const immediateId = toast('Immediate', { duration: 0 });
  const persistentId = toast.info('Persistent', { duration: Infinity });

  expect(store.getState().toast.toasts.map(item => item.id)).toEqual([
    immediateId,
    persistentId,
  ]);

  jest.runOnlyPendingTimers();

  expect(store.getState().toast.toasts.map(item => item.id)).toEqual([
    persistentId,
  ]);
});

test('evicts the oldest toast when the configured limit is reached', () => {
  store.dispatch(toastConfigUpdated({ limit: 2 }));
  const oldestId = toast('Oldest', { duration: Infinity });
  const middleId = toast('Middle', { duration: Infinity });
  const newestId = toast('Newest', { duration: Infinity });

  expect(store.getState().toast.toasts.map(item => item.id)).toEqual([
    middleId,
    newestId,
  ]);
  expect(store.getState().toast.toasts.some(item => item.id === oldestId)).toBe(
    false,
  );
});

test('updates a promise toast in place and preserves its result', async () => {
  const result = toast.promise(Promise.resolve('synced'), {
    error: 'Sync failed',
    loading: 'Syncing library',
    success: 'Library synced',
  });
  const id = store.getState().toast.toasts[0]?.id;

  await expect(result).resolves.toBe('synced');

  expect(store.getState().toast.toasts).toEqual([
    expect.objectContaining({
      duration: 4000,
      id,
      title: 'Library synced',
      type: 'success',
    }),
  ]);

  jest.advanceTimersByTime(4000);
  expect(store.getState().toast.toasts).toHaveLength(0);
});

test('rethrows promise failures and supports a zero settlement duration', async () => {
  const failure = new Error('network unavailable');
  store.dispatch(toastConfigUpdated({ duration: 0 }));

  const result = toast.promise(Promise.reject(failure), {
    error: 'Sync failed',
    loading: 'Syncing library',
    success: 'Library synced',
  });

  await expect(result).rejects.toBe(failure);
  expect(store.getState().toast.toasts).toEqual([
    expect.objectContaining({
      duration: 0,
      title: 'Sync failed',
      type: 'error',
    }),
  ]);

  jest.runOnlyPendingTimers();
  expect(store.getState().toast.toasts).toHaveLength(0);
});

test('does not recreate an evicted promise toast when it settles', async () => {
  let resolveRequest: ((value: string) => void) | undefined;
  const request = new Promise<string>(resolve => {
    resolveRequest = resolve;
  });
  const result = toast.promise(request, {
    error: 'Upload failed',
    loading: 'Uploading',
    success: 'Uploaded',
  });
  const promiseToastId = store.getState().toast.toasts[0]?.id;

  toast('First replacement', { duration: Infinity });
  toast('Second replacement', { duration: Infinity });
  toast('Third replacement', { duration: Infinity });
  expect(
    store.getState().toast.toasts.some(item => item.id === promiseToastId),
  ).toBe(false);

  resolveRequest?.('complete');
  await expect(result).resolves.toBe('complete');

  expect(
    store.getState().toast.toasts.some(item => item.id === promiseToastId),
  ).toBe(false);
});

test('trims existing toasts when the rendered limit decreases', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  const tree = (limit: number) => (
    <Provider store={store}>
      <SafeAreaProvider initialMetrics={TEST_WINDOW_METRICS}>
        <Toaster limit={limit} />
        <PortalHost />
      </SafeAreaProvider>
    </Provider>
  );

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(tree(3));
  });

  let newestId = '';
  await ReactTestRenderer.act(() => {
    toast('Oldest', { duration: Infinity });
    toast('Middle', { duration: Infinity });
    newestId = toast('Newest', { duration: Infinity });
  });

  await ReactTestRenderer.act(() => {
    renderer?.update(tree(1));
  });

  expect(store.getState().toast.toasts.map(item => item.id)).toEqual([
    newestId,
  ]);

  await ReactTestRenderer.act(() => {
    renderer?.unmount();
  });
});

test('dismisses an action toast before invoking its callback', async () => {
  const action = jest.fn();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <Provider store={store}>
        <SafeAreaProvider initialMetrics={TEST_WINDOW_METRICS}>
          <Toaster />
          <PortalHost />
        </SafeAreaProvider>
      </Provider>,
    );
  });

  await ReactTestRenderer.act(() => {
    toast('Queued', {
      action: {
        label: 'Undo',
        onPress: () => {
          expect(store.getState().toast.toasts).toHaveLength(0);
          action();
        },
      },
      duration: Infinity,
    });
  });

  const actionPressable = renderer?.root
    .findAllByType(PrimitivePressable)
    .find(node => typeof node.props.onPress === 'function');
  expect(actionPressable).toBeDefined();

  await ReactTestRenderer.act(() => {
    actionPressable?.props.onPress({} as GestureResponderEvent);
  });

  expect(action).toHaveBeenCalledTimes(1);
  expect(store.getState().toast.toasts).toHaveLength(0);

  await ReactTestRenderer.act(() => {
    renderer?.unmount();
  });
});
