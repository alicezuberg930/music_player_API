import { createModalPrimitive } from './modal';

const { Close, Content, Description, Overlay, Portal, Root, Title, Trigger } =
  createModalPrimitive(true);

const Action = Close;
const Cancel = Close;

export {
  Action,
  Cancel,
  Content,
  Description,
  Overlay,
  Portal,
  Root,
  Title,
  Trigger,
};
export type {
  CloseProps as ActionProps,
  CloseProps as CancelProps,
  ContentProps,
  DescriptionProps,
  OverlayProps,
  PortalProps,
  RootProps,
  TitleProps,
  TriggerProps,
} from './modal';
