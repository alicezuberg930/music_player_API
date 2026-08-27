import { createAnchoredPrimitive } from './anchored';

const { Content, Overlay, Portal, Root, Trigger, useRootContext } =
  createAnchoredPrimitive({
    contentRole: 'dialog',
    defaultAlign: 'center',
  });

export { Content, Overlay, Portal, Root, Trigger, useRootContext };
export type {
  ContentProps,
  OverlayProps,
  PortalProps,
  RootProps,
  TriggerProps,
} from './anchored';
