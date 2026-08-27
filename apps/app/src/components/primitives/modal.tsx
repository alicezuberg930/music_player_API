import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';
import {
  useBackHandler,
  useComposedRefs,
  useControllableState,
  useFocusOnOpen,
  useRestoreFocus,
} from './hooks';
import { Portal as PrimitivePortal } from './portal';
import { PrimitivePressable, PrimitiveText, PrimitiveView } from './primitive';
import type {
  ForceMountable,
  PressableRef,
  SlottablePressableProps,
  SlottableTextProps,
  SlottableViewProps,
  TextRef,
  ViewRef,
} from './types';

type RootProps = SlottableViewProps & {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
};

type RootContextValue = {
  id: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  triggerRef: React.RefObject<PressableRef | null>;
};

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
  ForceMountable & {
    onCloseAutoFocus?: (event: unknown) => void;
    onEscapeKeyDown?: (event: unknown) => void;
    onInteractOutside?: (event: unknown) => void;
    onOpenAutoFocus?: (event: unknown) => void;
    onPointerDownOutside?: (event: unknown) => void;
  };

type TriggerProps = SlottablePressableProps;
type CloseProps = SlottablePressableProps;
type TitleProps = SlottableTextProps;
type DescriptionProps = SlottableTextProps;

function createModalPrimitive(alert: boolean) {
  const RootContext = React.createContext<RootContextValue | null>(null);

  function useRootContext() {
    const context = React.useContext(RootContext);
    if (!context) {
      throw new Error('Modal compound components must be rendered inside Root');
    }
    return context;
  }

  const Root = React.forwardRef<ViewRef, RootProps>(
    ({ defaultOpen = false, onOpenChange, open: openProp, ...props }, ref) => {
      const id = React.useId();
      const triggerRef = React.useRef<PressableRef>(null);
      const [open = false, setOpen] = useControllableState({
        defaultProp: defaultOpen,
        onChange: onOpenChange,
        prop: openProp,
      });
      const close = React.useCallback(() => setOpen(false), [setOpen]);
      useBackHandler(open, close);
      const value = React.useMemo(
        () => ({ id, onOpenChange: setOpen, open, triggerRef }),
        [id, open, setOpen],
      );

      return (
        <RootContext.Provider value={value}>
          <PrimitiveView ref={ref} {...props} />
        </RootContext.Provider>
      );
    },
  );

  const Trigger = React.forwardRef<PressableRef, TriggerProps>(
    ({ disabled, onPress, ...props }, ref) => {
      const root = useRootContext();
      const composedRef = useComposedRefs(ref, root.triggerRef);
      useRestoreFocus(root.open, root.triggerRef);

      function handlePress(event: GestureResponderEvent) {
        onPress?.(event);
        if (!disabled && !event.isDefaultPrevented()) {
          root.onOpenChange(!root.open);
        }
      }

      return (
        <PrimitivePressable
          ref={composedRef}
          accessibilityRole="button"
          accessibilityState={{
            disabled: Boolean(disabled),
            expanded: root.open,
          }}
          disabled={disabled}
          onPress={handlePress}
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
    ({ closeOnPress = !alert, forceMount, onPress, ...props }, ref) => {
      const root = useRootContext();
      if (!forceMount && !root.open) {
        return null;
      }

      function handlePress(event: GestureResponderEvent) {
        onPress?.(event);
        if (closeOnPress && !event.isDefaultPrevented()) {
          root.onOpenChange(false);
        }
      }

      return (
        <PrimitivePressable
          ref={ref}
          accessible={false}
          onPress={handlePress}
          {...props}
        />
      );
    },
  );

  const Content = React.forwardRef<ViewRef, ContentProps>(
    (
      {
        forceMount,
        onCloseAutoFocus: _onCloseAutoFocus,
        onEscapeKeyDown: _onEscapeKeyDown,
        onInteractOutside: _onInteractOutside,
        onOpenAutoFocus: _onOpenAutoFocus,
        onPointerDownOutside: _onPointerDownOutside,
        ...props
      },
      ref,
    ) => {
      const root = useRootContext();
      const contentRef = React.useRef<ViewRef>(null);
      const composedRef = useComposedRefs(ref, contentRef);
      useFocusOnOpen(root.open, contentRef);

      if (!forceMount && !root.open) {
        return null;
      }

      return (
        <PrimitiveView
          ref={composedRef}
          accessibilityViewIsModal
          onAccessibilityEscape={() => root.onOpenChange(false)}
          onStartShouldSetResponder={() => true}
          role={alert ? 'alertdialog' : 'dialog'}
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
          root.onOpenChange(false);
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

  const Title = React.forwardRef<TextRef, TitleProps>((props, ref) => (
    <PrimitiveText ref={ref} accessibilityRole="header" {...props} />
  ));

  const Description = React.forwardRef<TextRef, DescriptionProps>(
    (props, ref) => <PrimitiveText ref={ref} {...props} />,
  );

  Root.displayName = alert ? 'AlertDialogRoot' : 'DialogRoot';
  Trigger.displayName = alert ? 'AlertDialogTrigger' : 'DialogTrigger';
  Overlay.displayName = alert ? 'AlertDialogOverlay' : 'DialogOverlay';
  Content.displayName = alert ? 'AlertDialogContent' : 'DialogContent';
  Close.displayName = alert ? 'AlertDialogClose' : 'DialogClose';
  Title.displayName = alert ? 'AlertDialogTitle' : 'DialogTitle';
  Description.displayName = alert
    ? 'AlertDialogDescription'
    : 'DialogDescription';

  return {
    Close,
    Content,
    Description,
    Overlay,
    Portal,
    Root,
    Title,
    Trigger,
    useRootContext,
  };
}

export { createModalPrimitive };
export type {
  CloseProps,
  ContentProps,
  DescriptionProps,
  OverlayProps,
  PortalProps,
  RootProps,
  TitleProps,
  TriggerProps,
};
