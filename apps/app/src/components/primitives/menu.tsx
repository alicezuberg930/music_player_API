import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { createAnchoredPrimitive } from './anchored';
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

type ItemProps = SlottablePressableProps & {
  closeOnPress?: boolean;
  textValue?: string;
};

type CheckboxItemProps = SlottablePressableProps & {
  checked: boolean;
  closeOnPress?: boolean;
  onCheckedChange: (checked: boolean) => void;
  textValue?: string;
};

type RadioGroupProps = SlottableViewProps & {
  onValueChange: (value: string) => void;
  value: string | undefined;
};

type RadioItemProps = SlottablePressableProps & {
  closeOnPress?: boolean;
  textValue?: string;
  value: string;
};

type SubProps = SlottableViewProps & {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
};

type SubTriggerProps = SlottablePressableProps & {
  textValue?: string;
};

type SubContentProps = SlottablePressableProps & ForceMountable;
type ItemIndicatorProps = SlottableViewProps & ForceMountable;
type GroupProps = SlottableViewProps;
type LabelProps = SlottableTextProps;
type SeparatorProps = SlottableViewProps & { decorative?: boolean };

type ItemContextValue = {
  selected: boolean;
};

type RadioContextValue = {
  onValueChange: (value: string) => void;
  value: string | undefined;
};

type SubContextValue = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function createMenuPrimitive(triggerMode: 'longPress' | 'press' = 'press') {
  const Anchored = createAnchoredPrimitive({
    contentRole: 'menu',
    triggerMode,
  });
  const ItemContext = React.createContext<ItemContextValue | null>(null);
  const RadioContext = React.createContext<RadioContextValue | null>(null);
  const SubContext = React.createContext<SubContextValue | null>(null);

  function useSubContext() {
    const context = React.useContext(SubContext);
    if (!context) {
      throw new Error('Menu sub components must be rendered inside Sub');
    }
    return context;
  }

  const Item = React.forwardRef<PressableRef, ItemProps>(
    (
      {
        closeOnPress = true,
        disabled,
        onPress,
        textValue: _textValue,
        ...props
      },
      ref,
    ) => {
      const root = Anchored.useRootContext();

      function handlePress(event: GestureResponderEvent) {
        onPress?.(event);
        if (!disabled && closeOnPress && !event.isDefaultPrevented()) {
          root.close();
        }
      }

      return (
        <PrimitivePressable
          ref={ref}
          accessibilityRole="menuitem"
          accessibilityState={{ disabled: Boolean(disabled) }}
          disabled={disabled}
          onPress={handlePress}
          {...props}
        />
      );
    },
  );

  const CheckboxItem = React.forwardRef<PressableRef, CheckboxItemProps>(
    (
      {
        checked,
        closeOnPress = true,
        disabled,
        onCheckedChange,
        onPress,
        textValue: _textValue,
        ...props
      },
      ref,
    ) => {
      const root = Anchored.useRootContext();

      function handlePress(event: GestureResponderEvent) {
        onPress?.(event);
        if (disabled || event.isDefaultPrevented()) {
          return;
        }
        onCheckedChange(!checked);
        if (closeOnPress) {
          root.close();
        }
      }

      return (
        <ItemContext.Provider value={{ selected: checked }}>
          <PrimitivePressable
            ref={ref}
            accessibilityRole="checkbox"
            accessibilityState={{ checked, disabled: Boolean(disabled) }}
            disabled={disabled}
            onPress={handlePress}
            {...props}
          />
        </ItemContext.Provider>
      );
    },
  );

  const RadioGroup = React.forwardRef<ViewRef, RadioGroupProps>(
    ({ onValueChange, value, ...props }, ref) => {
      const contextValue = React.useMemo(
        () => ({ onValueChange, value }),
        [onValueChange, value],
      );
      return (
        <RadioContext.Provider value={contextValue}>
          <PrimitiveView ref={ref} {...props} />
        </RadioContext.Provider>
      );
    },
  );

  const RadioItem = React.forwardRef<PressableRef, RadioItemProps>(
    (
      {
        closeOnPress = true,
        disabled,
        onPress,
        textValue: _textValue,
        value,
        ...props
      },
      ref,
    ) => {
      const root = Anchored.useRootContext();
      const radio = React.useContext(RadioContext);
      if (!radio) {
        throw new Error(
          'Menu.RadioItem must be rendered inside Menu.RadioGroup',
        );
      }
      const radioContext = radio;
      const selected = radioContext.value === value;

      function handlePress(event: GestureResponderEvent) {
        onPress?.(event);
        if (disabled || event.isDefaultPrevented()) {
          return;
        }
        radioContext.onValueChange(value);
        if (closeOnPress) {
          root.close();
        }
      }

      return (
        <ItemContext.Provider value={{ selected }}>
          <PrimitivePressable
            ref={ref}
            accessibilityRole="radio"
            accessibilityState={{
              checked: selected,
              disabled: Boolean(disabled),
            }}
            disabled={disabled}
            onPress={handlePress}
            {...props}
          />
        </ItemContext.Provider>
      );
    },
  );

  const ItemIndicator = React.forwardRef<ViewRef, ItemIndicatorProps>(
    ({ forceMount, ...props }, ref) => {
      const item = React.useContext(ItemContext);
      if (!item) {
        throw new Error(
          'Menu.ItemIndicator must be rendered inside a selectable item',
        );
      }
      if (!forceMount && !item.selected) {
        return null;
      }
      return <PrimitiveView ref={ref} {...props} />;
    },
  );

  const Sub = React.forwardRef<ViewRef, SubProps>(
    ({ defaultOpen = false, onOpenChange, open: openProp, ...props }, ref) => {
      const [open = false, setOpen] = useControllableState({
        defaultProp: defaultOpen,
        onChange: onOpenChange,
        prop: openProp,
      });
      const value = React.useMemo(
        () => ({ onOpenChange: setOpen, open }),
        [open, setOpen],
      );
      return (
        <SubContext.Provider value={value}>
          <PrimitiveView ref={ref} {...props} />
        </SubContext.Provider>
      );
    },
  );

  const SubTrigger = React.forwardRef<PressableRef, SubTriggerProps>(
    ({ disabled, onPress, textValue: _textValue, ...props }, ref) => {
      const sub = useSubContext();

      function handlePress(event: GestureResponderEvent) {
        onPress?.(event);
        if (!disabled && !event.isDefaultPrevented()) {
          sub.onOpenChange(!sub.open);
        }
      }

      return (
        <PrimitivePressable
          ref={ref}
          accessibilityRole="menuitem"
          accessibilityState={{
            disabled: Boolean(disabled),
            expanded: sub.open,
          }}
          disabled={disabled}
          onPress={handlePress}
          {...props}
        />
      );
    },
  );

  const SubContent = React.forwardRef<PressableRef, SubContentProps>(
    ({ forceMount, ...props }, ref) => {
      const sub = useSubContext();
      if (!forceMount && !sub.open) {
        return null;
      }
      return (
        <PrimitivePressable
          ref={ref}
          accessibilityRole="menu"
          onAccessibilityEscape={() => sub.onOpenChange(false)}
          onStartShouldSetResponder={() => true}
          {...props}
        />
      );
    },
  );

  const Group = React.forwardRef<ViewRef, GroupProps>((props, ref) => (
    <PrimitiveView ref={ref} accessibilityRole="group" {...props} />
  ));
  const Label = React.forwardRef<TextRef, LabelProps>((props, ref) => (
    <PrimitiveText ref={ref} {...props} />
  ));
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

  Item.displayName = 'MenuItem';
  CheckboxItem.displayName = 'MenuCheckboxItem';
  RadioGroup.displayName = 'MenuRadioGroup';
  RadioItem.displayName = 'MenuRadioItem';
  ItemIndicator.displayName = 'MenuItemIndicator';
  Sub.displayName = 'MenuSub';
  SubTrigger.displayName = 'MenuSubTrigger';
  SubContent.displayName = 'MenuSubContent';
  Group.displayName = 'MenuGroup';
  Label.displayName = 'MenuLabel';
  Separator.displayName = 'MenuSeparator';

  return {
    CheckboxItem,
    Content: Anchored.Content,
    Group,
    Item,
    ItemIndicator,
    Label,
    Overlay: Anchored.Overlay,
    Portal: Anchored.Portal,
    RadioGroup,
    RadioItem,
    Root: Anchored.Root,
    Separator,
    Sub,
    SubContent,
    SubTrigger,
    Trigger: Anchored.Trigger,
    useRootContext: Anchored.useRootContext,
    useSubContext,
  };
}

export { createMenuPrimitive };
export type {
  CheckboxItemProps,
  GroupProps,
  ItemIndicatorProps,
  ItemProps,
  LabelProps,
  RadioGroupProps,
  RadioItemProps,
  SeparatorProps,
  SubContentProps,
  SubProps,
  SubTriggerProps,
};
