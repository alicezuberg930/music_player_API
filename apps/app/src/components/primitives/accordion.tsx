import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { useControllableState } from './hooks';
import { PrimitivePressable, PrimitiveView } from './primitive';
import type {
  ForceMountable,
  PressableRef,
  SlottablePressableProps,
  SlottableViewProps,
  ViewRef,
} from './types';

type SingleRootProps = {
  defaultValue?: string;
  onValueChange?: (value: string | undefined) => void;
  type: 'single';
  value?: string;
};

type MultipleRootProps = {
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  type: 'multiple';
  value?: string[];
};

type RootProps = (SingleRootProps | MultipleRootProps) &
  SlottableViewProps & {
    collapsible?: boolean;
    dir?: 'ltr' | 'rtl';
    disabled?: boolean;
    orientation?: 'horizontal' | 'vertical';
  };

type RootContextValue = {
  collapsible: boolean;
  disabled: boolean;
  onItemPress: (itemValue: string) => void;
  type: 'multiple' | 'single';
  value: string | string[] | undefined;
};

type ItemContextValue = {
  disabled: boolean;
  isExpanded: boolean;
  value: string;
};

const RootContext = React.createContext<RootContextValue | null>(null);
const ItemContext = React.createContext<ItemContextValue | null>(null);

function useRootContext() {
  const context = React.useContext(RootContext);
  if (!context) {
    throw new Error(
      'Accordion compound components must be rendered inside Accordion.Root',
    );
  }
  return context;
}

function useItemContext() {
  const context = React.useContext(ItemContext);
  if (!context) {
    throw new Error(
      'Accordion item components must be rendered inside Accordion.Item',
    );
  }
  return context;
}

const Root = React.forwardRef<ViewRef, RootProps>((props, ref) => {
  const { collapsible = false, disabled = false, type, ...viewProps } = props;
  const controlledValue = props.value;
  const defaultValue =
    props.defaultValue ?? (type === 'multiple' ? [] : undefined);
  const onChange = props.onValueChange as
    ((value: string | string[] | undefined) => void) | undefined;
  const [value, setValue] = useControllableState<string | string[] | undefined>(
    {
      defaultProp: defaultValue,
      onChange,
      prop: controlledValue,
    },
  );

  const onItemPress = React.useCallback(
    (itemValue: string) => {
      if (type === 'multiple') {
        const currentValue = Array.isArray(value) ? value : [];
        setValue(
          currentValue.includes(itemValue)
            ? currentValue.filter(entry => entry !== itemValue)
            : [...currentValue, itemValue],
        );
        return;
      }

      if (value === itemValue) {
        if (collapsible) {
          setValue(undefined);
        }
        return;
      }
      setValue(itemValue);
    },
    [collapsible, setValue, type, value],
  );

  const contextValue = React.useMemo(
    () => ({ collapsible, disabled, onItemPress, type, value }),
    [collapsible, disabled, onItemPress, type, value],
  );

  delete (viewProps as Partial<RootProps>).defaultValue;
  delete (viewProps as Partial<RootProps>).dir;
  delete (viewProps as Partial<RootProps>).onValueChange;
  delete (viewProps as Partial<RootProps>).orientation;

  return (
    <RootContext.Provider value={contextValue}>
      <PrimitiveView ref={ref} {...viewProps} />
    </RootContext.Provider>
  );
});

type ItemProps = SlottableViewProps & {
  disabled?: boolean;
  value: string;
};

const Item = React.forwardRef<ViewRef, ItemProps>(
  ({ disabled = false, value, ...props }, ref) => {
    const root = useRootContext();
    const isExpanded = Array.isArray(root.value)
      ? root.value.includes(value)
      : root.value === value;
    const contextValue = React.useMemo(
      () => ({ disabled: disabled || root.disabled, isExpanded, value }),
      [disabled, isExpanded, root.disabled, value],
    );

    return (
      <ItemContext.Provider value={contextValue}>
        <PrimitiveView ref={ref} {...props} />
      </ItemContext.Provider>
    );
  },
);

type HeaderProps = SlottableViewProps;
const Header = React.forwardRef<ViewRef, HeaderProps>((props, ref) => (
  <PrimitiveView ref={ref} accessibilityRole="header" {...props} />
));

type TriggerProps = SlottablePressableProps;
const Trigger = React.forwardRef<PressableRef, TriggerProps>(
  ({ disabled, onPress, ...props }, ref) => {
    const root = useRootContext();
    const item = useItemContext();
    const isDisabled = Boolean(disabled || item.disabled);

    function handlePress(event: GestureResponderEvent) {
      onPress?.(event);
      if (!isDisabled && !event.isDefaultPrevented()) {
        root.onItemPress(item.value);
      }
    }

    return (
      <PrimitivePressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, expanded: item.isExpanded }}
        disabled={isDisabled}
        onPress={handlePress}
        {...props}
      />
    );
  },
);

type ContentProps = SlottableViewProps & ForceMountable;
const Content = React.forwardRef<ViewRef, ContentProps>(
  ({ forceMount, ...props }, ref) => {
    const { isExpanded } = useItemContext();
    if (!forceMount && !isExpanded) {
      return null;
    }
    return <PrimitiveView ref={ref} {...props} />;
  },
);

Root.displayName = 'AccordionRoot';
Item.displayName = 'AccordionItem';
Header.displayName = 'AccordionHeader';
Trigger.displayName = 'AccordionTrigger';
Content.displayName = 'AccordionContent';

export { Content, Header, Item, Root, Trigger, useItemContext, useRootContext };
export type { ContentProps, HeaderProps, ItemProps, RootProps, TriggerProps };
