import * as React from 'react';
import {
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type LayoutRectangle,
  useWindowDimensions,
} from 'react-native';
import {
  useBackHandler,
  useComposedRefs,
  useControllableState,
  useFocusOnOpen,
  useRestoreFocus,
} from './hooks';
import { Portal as PrimitivePortal } from './portal';
import { getPosition, type Size } from './positioning';
import { PrimitivePressable, PrimitiveView } from './primitive';
import type {
  ForceMountable,
  PositionedContentProps,
  PressableRef,
  SlottablePressableProps,
  SlottableViewProps,
  ViewRef,
} from './types';

type RootProps = SlottableViewProps & {
  closeDelay?: number;
  defaultOpen?: boolean;
  delayDuration?: number;
  disableHoverableContent?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  openDelay?: number;
  relativeTo?: 'longPress' | 'trigger';
  skipDelayDuration?: number;
};

type TriggerHandle = PressableRef & {
  close: () => void;
  open: () => void;
};

type TriggerProps = SlottablePressableProps;

type PortalProps = ForceMountable & {
  children: React.ReactNode;
  container?: unknown;
  hostName?: string;
};

type OverlayProps = SlottablePressableProps &
  ForceMountable & {
    closeOnPress?: boolean;
  };

type ContentProps = SlottableViewProps &
  PositionedContentProps &
  ForceMountable & {
    onOpenAutoFocus?: (event: unknown) => void;
    position?: 'item-aligned' | 'popper';
  };

type CloseProps = SlottablePressableProps;

type RootContextValue = {
  anchor: LayoutRectangle | null;
  close: () => void;
  id: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  openAt: (anchor?: LayoutRectangle) => void;
  relativeTo: 'longPress' | 'trigger';
  toggle: () => void;
  triggerRef: React.RefObject<PressableRef | null>;
};

type AnchoredPrimitiveOptions = {
  contentRole?: 'dialog' | 'listbox' | 'menu' | 'tooltip';
  defaultAlign?: 'start' | 'center' | 'end';
  defaultSide?: 'top' | 'right' | 'bottom' | 'left';
  triggerMode?: 'longPress' | 'press';
};

const HIDDEN_STYLE = { opacity: 0 } as const;

function createAnchoredPrimitive({
  contentRole = 'dialog',
  defaultAlign = 'start',
  defaultSide = 'bottom',
  triggerMode = 'press',
}: AnchoredPrimitiveOptions = {}) {
  const RootContext = React.createContext<RootContextValue | null>(null);

  function useRootContext() {
    const context = React.useContext(RootContext);
    if (!context) {
      throw new Error(
        'Anchored compound components must be rendered inside Root',
      );
    }
    return context;
  }

  const Root = React.forwardRef<ViewRef, RootProps>(
    (
      {
        closeDelay: _closeDelay,
        defaultOpen = false,
        delayDuration: _delayDuration,
        disableHoverableContent: _disableHoverableContent,
        onOpenChange,
        open: openProp,
        openDelay: _openDelay,
        relativeTo = 'longPress',
        skipDelayDuration: _skipDelayDuration,
        ...props
      },
      ref,
    ) => {
      const id = React.useId();
      const triggerRef = React.useRef<PressableRef>(null);
      const [anchor, setAnchor] = React.useState<LayoutRectangle | null>(null);
      const [open = false, setOpen] = useControllableState({
        defaultProp: defaultOpen,
        onChange: onOpenChange,
        prop: openProp,
      });

      const close = React.useCallback(() => setOpen(false), [setOpen]);
      const openAt = React.useCallback(
        (nextAnchor?: LayoutRectangle) => {
          if (nextAnchor) {
            setAnchor(nextAnchor);
            setOpen(true);
            return;
          }

          triggerRef.current?.measureInWindow((x, y, width, height) => {
            setAnchor({ height, width, x, y });
            setOpen(true);
          });
        },
        [setOpen],
      );
      const toggle = React.useCallback(() => {
        if (open) {
          close();
        } else {
          openAt();
        }
      }, [close, open, openAt]);

      useBackHandler(open, close);

      const value = React.useMemo(
        () => ({
          anchor,
          close,
          id,
          onOpenChange: setOpen,
          open,
          openAt,
          relativeTo,
          toggle,
          triggerRef,
        }),
        [anchor, close, id, open, openAt, relativeTo, setOpen, toggle],
      );

      return (
        <RootContext.Provider value={value}>
          <PrimitiveView ref={ref} {...props} />
        </RootContext.Provider>
      );
    },
  );

  const Trigger = React.forwardRef<TriggerHandle, TriggerProps>(
    (
      { disabled, onAccessibilityAction, onLongPress, onPress, ...props },
      forwardedRef,
    ) => {
      const root = useRootContext();
      useRestoreFocus(root.open, root.triggerRef);

      const setTriggerRef = React.useCallback(
        (node: PressableRef | null) => {
          root.triggerRef.current = node;
          if (node) {
            Object.assign(node, { close: root.close, open: root.openAt });
          }
          if (typeof forwardedRef === 'function') {
            forwardedRef(node as TriggerHandle | null);
          } else if (forwardedRef) {
            forwardedRef.current = node as TriggerHandle | null;
          }
        },
        [forwardedRef, root.close, root.openAt, root.triggerRef],
      );

      function handlePress(event: GestureResponderEvent) {
        onPress?.(event);
        if (!disabled && !event.isDefaultPrevented()) {
          root.toggle();
        }
      }

      function handleLongPress(event: GestureResponderEvent) {
        onLongPress?.(event);
        if (disabled || event.isDefaultPrevented()) {
          return;
        }

        if (root.relativeTo === 'longPress') {
          root.openAt({
            height: 0,
            width: 0,
            x: event.nativeEvent.pageX,
            y: event.nativeEvent.pageY,
          });
        } else {
          root.openAt();
        }
      }

      return (
        <PrimitivePressable
          ref={setTriggerRef}
          accessibilityActions={
            triggerMode === 'longPress'
              ? [{ name: 'longpress', label: 'Open menu' }]
              : undefined
          }
          accessibilityRole="button"
          accessibilityState={{
            disabled: Boolean(disabled),
            expanded: root.open,
          }}
          disabled={disabled}
          onAccessibilityAction={event => {
            onAccessibilityAction?.(event);
            if (!disabled && event.nativeEvent.actionName === 'longpress') {
              root.openAt();
            }
          }}
          onLongPress={
            triggerMode === 'longPress' ? handleLongPress : onLongPress
          }
          onPress={triggerMode === 'press' ? handlePress : onPress}
          {...props}
        />
      );
    },
  );

  function Portal({
    children,
    container: _container,
    forceMount,
    hostName,
  }: PortalProps) {
    const root = useRootContext();
    if (!forceMount && !root.open) {
      return null;
    }

    return (
      <PrimitivePortal hostName={hostName} name={`${root.id}-portal`}>
        <RootContext.Provider value={root}>{children}</RootContext.Provider>
      </PrimitivePortal>
    );
  }

  const Overlay = React.forwardRef<PressableRef, OverlayProps>(
    ({ closeOnPress = true, forceMount, onPress, ...props }, ref) => {
      const root = useRootContext();
      if (!forceMount && !root.open) {
        return null;
      }

      function handlePress(event: GestureResponderEvent) {
        onPress?.(event);
        if (closeOnPress && !event.isDefaultPrevented()) {
          root.close();
        }
      }

      return (
        <PrimitivePressable
          ref={ref}
          accessible={false}
          onPress={handlePress}
          pointerEvents={root.open ? 'auto' : 'none'}
          {...props}
        />
      );
    },
  );

  const Content = React.forwardRef<ViewRef, ContentProps>(
    (
      {
        align = defaultAlign,
        alignOffset,
        avoidCollisions,
        disablePositioningStyle,
        forceMount,
        insets,
        onLayout,
        onOpenAutoFocus: _onOpenAutoFocus,
        position: _position,
        side = defaultSide,
        sideOffset,
        style,
        ...props
      },
      ref,
    ) => {
      const root = useRootContext();
      const contentRef = React.useRef<ViewRef>(null);
      const composedRef = useComposedRefs(ref, contentRef);
      const [contentSize, setContentSize] = React.useState<Size | null>(null);
      const screen = useWindowDimensions();
      useFocusOnOpen(root.open, contentRef);

      if (!forceMount && !root.open) {
        return null;
      }

      function handleLayout(event: LayoutChangeEvent) {
        const { height, width } = event.nativeEvent.layout;
        setContentSize(currentSize =>
          currentSize?.height === height && currentSize.width === width
            ? currentSize
            : { height, width },
        );
        onLayout?.(event);
      }

      const positioningStyle = getPosition({
        align,
        alignOffset,
        anchor: root.anchor,
        avoidCollisions,
        content: contentSize,
        disablePositioningStyle,
        insets,
        screen,
        side,
        sideOffset,
      });

      return (
        <PrimitiveView
          ref={composedRef}
          accessibilityViewIsModal={contentRole !== 'tooltip'}
          onAccessibilityEscape={root.close}
          onLayout={handleLayout}
          onStartShouldSetResponder={() => true}
          pointerEvents={root.open ? 'auto' : 'none'}
          role={contentRole === 'listbox' ? 'menu' : contentRole}
          style={[positioningStyle, !root.open && HIDDEN_STYLE, style]}
          {...props}
        />
      );
    },
  );

  const Close = React.forwardRef<PressableRef, CloseProps>(
    ({ disabled, onPress, ...props }, ref) => {
      const root = useRootContext();

      function handlePress(event: GestureResponderEvent) {
        onPress?.(event);
        if (!disabled && !event.isDefaultPrevented()) {
          root.close();
        }
      }

      return (
        <PrimitivePressable
          ref={ref}
          accessibilityRole="button"
          accessibilityState={{ disabled: Boolean(disabled) }}
          disabled={disabled}
          onPress={handlePress}
          {...props}
        />
      );
    },
  );

  Root.displayName = 'AnchoredRoot';
  Trigger.displayName = 'AnchoredTrigger';
  Overlay.displayName = 'AnchoredOverlay';
  Content.displayName = 'AnchoredContent';
  Close.displayName = 'AnchoredClose';

  return { Close, Content, Overlay, Portal, Root, Trigger, useRootContext };
}

export { createAnchoredPrimitive };
export type {
  CloseProps,
  ContentProps,
  OverlayProps,
  PortalProps,
  RootContextValue,
  RootProps,
  TriggerHandle,
  TriggerProps,
};
