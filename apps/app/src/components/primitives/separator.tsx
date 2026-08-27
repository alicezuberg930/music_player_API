import * as React from 'react';
import { PrimitiveView } from './primitive';
import type { SlottableViewProps, ViewRef } from './types';

type RootProps = SlottableViewProps & {
  decorative?: boolean;
  orientation?: 'horizontal' | 'vertical';
};

const Root = React.forwardRef<ViewRef, RootProps>(
  ({ decorative = false, orientation = 'horizontal', ...props }, ref) => (
    <PrimitiveView
      ref={ref}
      accessibilityElementsHidden={decorative}
      aria-orientation={decorative ? undefined : orientation}
      role={decorative ? 'presentation' : 'separator'}
      {...props}
    />
  ),
);

Root.displayName = 'SeparatorRoot';

export { Root };
export type { RootProps };
