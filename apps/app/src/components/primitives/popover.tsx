import { createAnchoredPrimitive } from './anchored';

const { Close, Content, Overlay, Portal, Root, Trigger, useRootContext } =
  createAnchoredPrimitive({ contentRole: 'dialog', defaultAlign: 'center' });

export { Close, Content, Overlay, Portal, Root, Trigger, useRootContext };
export type {
  CloseProps,
  ContentProps,
  OverlayProps,
  PortalProps,
  RootProps,
  TriggerProps,
} from './anchored';
