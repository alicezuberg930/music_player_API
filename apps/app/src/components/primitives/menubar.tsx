import * as React from 'react';
import { createMenuPrimitive } from './menu';
import { PrimitiveView } from './primitive';
import type {
  SlottablePressableProps,
  SlottableViewProps,
  ViewRef,
} from './types';

type RootProps = SlottableViewProps & {
  onValueChange: (value: string | undefined) => void;
  value: string | undefined;
};

type MenuProps = SlottableViewProps & {
  value: string | undefined;
};

type RootContextValue = {
  onValueChange: (value: string | undefined) => void;
  value: string | undefined;
};

type MenuContextValue = {
  value: string;
};

const RootContext = React.createContext<RootContextValue | null>(null);
const MenuContext = React.createContext<MenuContextValue | null>(null);
const MenuPrimitive = createMenuPrimitive();

function useRootContext() {
  const context = React.useContext(RootContext);
  if (!context) {
    throw new Error(
      'Menubar compound components must be rendered inside Menubar.Root',
    );
  }
  return context;
}

function useMenuContext() {
  const context = React.useContext(MenuContext);
  if (!context) {
    throw new Error(
      'Menubar menu components must be rendered inside Menubar.Menu',
    );
  }
  return context;
}

const Root = React.forwardRef<ViewRef, RootProps>(
  ({ onValueChange, value, ...props }, ref) => {
    const contextValue = React.useMemo(
      () => ({ onValueChange, value }),
      [onValueChange, value],
    );
    return (
      <RootContext.Provider value={contextValue}>
        <PrimitiveView ref={ref} accessibilityRole="menubar" {...props} />
      </RootContext.Provider>
    );
  },
);

const Menu = React.forwardRef<ViewRef, MenuProps>(
  ({ value, ...props }, ref) => {
    const id = React.useId();
    const root = useRootContext();
    const menuValue = value ?? id;
    const contextValue = React.useMemo(
      () => ({ value: menuValue }),
      [menuValue],
    );

    return (
      <MenuContext.Provider value={contextValue}>
        <MenuPrimitive.Root
          ref={ref}
          open={root.value === menuValue}
          onOpenChange={open =>
            root.onValueChange(open ? menuValue : undefined)
          }
          {...props}
        />
      </MenuContext.Provider>
    );
  },
);

type TriggerProps = SlottablePressableProps;
const Trigger = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.Trigger>,
  TriggerProps
>((props, ref) => <MenuPrimitive.Trigger ref={ref} {...props} />);

type PortalProps = React.ComponentProps<typeof MenuPrimitive.Portal>;
function Portal({ children, ...props }: PortalProps) {
  const root = useRootContext();
  const menu = useMenuContext();
  return (
    <MenuPrimitive.Portal {...props}>
      <RootContext.Provider value={root}>
        <MenuContext.Provider value={menu}>{children}</MenuContext.Provider>
      </RootContext.Provider>
    </MenuPrimitive.Portal>
  );
}

const CheckboxItem = MenuPrimitive.CheckboxItem;
const Content = MenuPrimitive.Content;
const Group = MenuPrimitive.Group;
const Item = MenuPrimitive.Item;
const ItemIndicator = MenuPrimitive.ItemIndicator;
const Label = MenuPrimitive.Label;
const RadioGroup = MenuPrimitive.RadioGroup;
const RadioItem = MenuPrimitive.RadioItem;
const Separator = MenuPrimitive.Separator;
const Sub = MenuPrimitive.Sub;
const SubContent = MenuPrimitive.SubContent;
const SubTrigger = MenuPrimitive.SubTrigger;
const useSubContext = MenuPrimitive.useSubContext;

Root.displayName = 'MenubarRoot';
Menu.displayName = 'MenubarMenu';
Trigger.displayName = 'MenubarTrigger';

export {
  CheckboxItem,
  Content,
  Group,
  Item,
  ItemIndicator,
  Label,
  Menu,
  Portal,
  RadioGroup,
  RadioItem,
  Root,
  Separator,
  Sub,
  SubContent,
  SubTrigger,
  Trigger,
  useMenuContext,
  useRootContext,
  useSubContext,
};
export type { MenuProps, PortalProps, RootProps, TriggerProps };
