import { createAnchoredPrimitive } from './anchored';

const { Content, Overlay, Portal, Root, Trigger, useRootContext } =
  createAnchoredPrimitive({
    contentRole: 'tooltip',
    defaultAlign: 'center',
    defaultSide: 'top',
  });

export { Content, Overlay, Portal, Root, Trigger, useRootContext };
export type {
  ContentProps,
  OverlayProps,
  PortalProps,
  RootProps,
  TriggerProps,
} from './anchored';
