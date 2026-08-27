import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { createAnchoredPrimitive, type TriggerHandle } from './anchored';
import { useControllableState } from './hooks';
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

type Option =
  | {
      label: string;
      value: string;
    }
  | undefined;

type RootProps = SlottableViewProps & {
  defaultValue?: Option;
  dir?: 'ltr' | 'rtl';
  disabled?: boolean;
  name?: string;
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (option: Option) => void;
  required?: boolean;
  value?: Option;
};

type RootContextValue = {
  disabled: boolean;
  onValueChange: (option: Option) => void;
  value: Option;
};

type ItemContextValue = {
  label: string;
  selected: boolean;
};

const RootContext = React.createContext<RootContextValue | null>(null);
const ItemContext = React.createContext<ItemContextValue | null>(null);
const Anchored = createAnchoredPrimitive({ contentRole: 'listbox' });

function useRootContext() {
  const context = React.useContext(RootContext);
  if (!context) {
    throw new Error(
      'Select compound components must be rendered inside Select.Root',
    );
  }
  return context;
}

const Root = React.forwardRef<ViewRef, RootProps>(
  (
    {
      defaultValue,
      dir: _dir,
      disabled = false,
      name: _name,
      onOpenChange,
      onValueChange,
      required: _required,
      value: valueProp,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = useControllableState<Option>({
      defaultProp: defaultValue,
      onChange: onValueChange,
      prop: valueProp,
    });
    const contextValue = React.useMemo(
      () => ({ disabled, onValueChange: setValue, value }),
      [disabled, setValue, value],
    );

    return (
      <RootContext.Provider value={contextValue}>
        <Anchored.Root ref={ref} onOpenChange={onOpenChange} {...props} />
      </RootContext.Provider>
    );
  },
);

type TriggerProps = SlottablePressableProps;
const Trigger = React.forwardRef<TriggerHandle, TriggerProps>(
  ({ disabled, ...props }, ref) => {
    const root = useRootContext();
    const isDisabled = Boolean(disabled || root.disabled);
    return (
      <Anchored.Trigger
        ref={ref}
        accessibilityRole="combobox"
        disabled={isDisabled}
        {...props}
      />
    );
  },
);

type ValueProps = SlottableTextProps & {
  placeholder: string;
};
const Value = React.forwardRef<TextRef, ValueProps>(
  ({ children, placeholder, ...props }, ref) => {
    const { value } = useRootContext();
    return (
      <PrimitiveText ref={ref} {...props}>
        {children ?? value?.label ?? placeholder}
      </PrimitiveText>
    );
  },
);

type PortalProps = React.ComponentProps<typeof Anchored.Portal>;
function Portal({ children, ...props }: PortalProps) {
  const value = useRootContext();
  return (
    <Anchored.Portal {...props}>
      <RootContext.Provider value={value}>{children}</RootContext.Provider>
    </Anchored.Portal>
  );
}

const Overlay = Anchored.Overlay;
const Content = Anchored.Content;

type GroupProps = SlottableViewProps;
const Group = React.forwardRef<ViewRef, GroupProps>((props, ref) => (
  <PrimitiveView ref={ref} {...props} />
));

type LabelProps = SlottableTextProps;
const Label = React.forwardRef<TextRef, LabelProps>((props, ref) => (
  <PrimitiveText ref={ref} {...props} />
));

type ItemProps = SlottablePressableProps & {
  closeOnPress?: boolean;
  label: string;
  value: string;
};
const Item = React.forwardRef<PressableRef, ItemProps>(
  ({ closeOnPress = true, disabled, label, onPress, value, ...props }, ref) => {
    const root = useRootContext();
    const anchored = Anchored.useRootContext();
    const selected = root.value?.value === value;
    const isDisabled = Boolean(disabled || root.disabled);

    function handlePress(event: GestureResponderEvent) {
      onPress?.(event);
      if (isDisabled || event.isDefaultPrevented()) {
        return;
      }
      root.onValueChange({ label, value });
      if (closeOnPress) {
        anchored.close();
      }
    }

    return (
      <ItemContext.Provider value={{ label, selected }}>
        <PrimitivePressable
          ref={ref}
          accessibilityRole="option"
          accessibilityState={{ disabled: isDisabled, selected }}
          disabled={isDisabled}
          onPress={handlePress}
          {...props}
        />
      </ItemContext.Provider>
    );
  },
);

type ItemIndicatorProps = SlottableViewProps & ForceMountable;
const ItemIndicator = React.forwardRef<ViewRef, ItemIndicatorProps>(
  ({ forceMount, ...props }, ref) => {
    const item = React.useContext(ItemContext);
    if (!item) {
      throw new Error(
        'Select.ItemIndicator must be rendered inside Select.Item',
      );
    }
    if (!forceMount && !item.selected) {
      return null;
    }
    return <PrimitiveView ref={ref} {...props} />;
  },
);

type ItemTextProps = Omit<SlottableTextProps, 'children'>;
const ItemText = React.forwardRef<TextRef, ItemTextProps>((props, ref) => {
  const item = React.useContext(ItemContext);
  if (!item) {
    throw new Error('Select.ItemText must be rendered inside Select.Item');
  }
  return (
    <PrimitiveText ref={ref} {...props}>
      {item.label}
    </PrimitiveText>
  );
});

type SeparatorProps = SlottableViewProps & {
  decorative?: boolean;
};
const Separator = React.forwardRef<ViewRef, SeparatorProps>(
  ({ decorative = false, ...props }, ref) => (
    <PrimitiveView
      ref={ref}
      accessibilityElementsHidden={decorative}
      accessibilityRole={decorative ? 'none' : undefined}
      {...props}
    />
  ),
);

type ViewportProps = SlottableViewProps;
const Viewport = React.forwardRef<ViewRef, ViewportProps>((props, ref) => (
  <PrimitiveView ref={ref} {...props} />
));

type ScrollButtonProps = SlottablePressableProps;
const ScrollUpButton = React.forwardRef<PressableRef, ScrollButtonProps>(
  (props, ref) => <PrimitivePressable ref={ref} {...props} />,
);
const ScrollDownButton = React.forwardRef<PressableRef, ScrollButtonProps>(
  (props, ref) => <PrimitivePressable ref={ref} {...props} />,
);

Root.displayName = 'SelectRoot';
Trigger.displayName = 'SelectTrigger';
Value.displayName = 'SelectValue';
Group.displayName = 'SelectGroup';
Label.displayName = 'SelectLabel';
Item.displayName = 'SelectItem';
ItemIndicator.displayName = 'SelectItemIndicator';
ItemText.displayName = 'SelectItemText';
Separator.displayName = 'SelectSeparator';
Viewport.displayName = 'SelectViewport';
ScrollUpButton.displayName = 'SelectScrollUpButton';
ScrollDownButton.displayName = 'SelectScrollDownButton';

export {
  Content,
  Group,
  Item,
  ItemIndicator,
  ItemText,
  Label,
  Overlay,
  Portal,
  Root,
  ScrollDownButton,
  ScrollUpButton,
  Separator,
  Trigger,
  Value,
  Viewport,
  useRootContext,
};
export type {
  GroupProps,
  ItemIndicatorProps,
  ItemProps,
  ItemTextProps,
  LabelProps,
  Option,
  PortalProps,
  RootProps,
  ScrollButtonProps,
  SeparatorProps,
  TriggerProps,
  ValueProps,
  ViewportProps,
};
