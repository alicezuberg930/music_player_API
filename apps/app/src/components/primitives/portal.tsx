import * as React from 'react';
import { StyleSheet, View } from 'react-native';

const DEFAULT_HOST_NAME = '__native_primitives_default_host__';

const entries = new Map<string, Map<string, React.ReactNode>>();
const listeners = new Map<string, Set<() => void>>();
const revisions = new Map<string, number>();

function emit(hostName: string) {
  revisions.set(hostName, (revisions.get(hostName) ?? 0) + 1);
  listeners.get(hostName)?.forEach(listener => listener());
}

function setEntry(hostName: string, name: string, children: React.ReactNode) {
  const hostEntries = new Map(entries.get(hostName));
  hostEntries.set(name, children);
  entries.set(hostName, hostEntries);
  emit(hostName);
}

function removeEntry(hostName: string, name: string) {
  const hostEntries = new Map(entries.get(hostName));
  hostEntries.delete(name);
  entries.set(hostName, hostEntries);
  emit(hostName);
}

function subscribe(hostName: string, listener: () => void) {
  const hostListeners = listeners.get(hostName) ?? new Set();
  hostListeners.add(listener);
  listeners.set(hostName, hostListeners);

  return () => {
    hostListeners.delete(listener);
  };
}

function PortalHost({ name = DEFAULT_HOST_NAME }: { name?: string }) {
  React.useSyncExternalStore(
    React.useCallback(listener => subscribe(name, listener), [name]),
    React.useCallback(() => revisions.get(name) ?? 0, [name]),
    () => 0,
  );

  const hostEntries = entries.get(name);
  if (!hostEntries?.size) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {Array.from(hostEntries, ([key, node]) => (
        <React.Fragment key={key}>{node}</React.Fragment>
      ))}
    </View>
  );
}

function Portal({
  children,
  hostName = DEFAULT_HOST_NAME,
  name,
}: {
  children: React.ReactNode;
  hostName?: string;
  name: string;
}) {
  React.useLayoutEffect(() => {
    setEntry(hostName, name, children);
  }, [children, hostName, name]);

  React.useLayoutEffect(
    () => () => {
      removeEntry(hostName, name);
    },
    [hostName, name],
  );

  return null;
}

export { Portal, PortalHost };
