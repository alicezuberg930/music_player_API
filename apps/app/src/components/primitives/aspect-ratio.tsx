import * as React from 'react';
import type { ViewStyle } from 'react-native';
import { PrimitiveView } from './primitive';
import type { SlottableViewProps, ViewRef } from './types';

type RootProps = SlottableViewProps & {
  ratio?: number;
};

const Root = React.forwardRef<ViewRef, RootProps>(
  ({ ratio = 1, style, ...props }, ref) => {
    return (
      <PrimitiveView
        ref={ref}
        style={[{ aspectRatio: ratio } as ViewStyle, style]}
        {...props}
      />
    );
  },
);

Root.displayName = 'AspectRatioRoot';

export { Root };
export type { RootProps };
