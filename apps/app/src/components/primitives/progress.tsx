import * as React from 'react';
import { PrimitiveView } from './primitive';
import type { SlottableViewProps, ViewRef } from './types';

type RootProps = SlottableViewProps & {
  getValueLabel?: (value: number, max: number) => string;
  max?: number;
  value?: null | number;
};

const Root = React.forwardRef<ViewRef, RootProps>(
  (
    {
      getValueLabel = defaultGetValueLabel,
      max: maxProp = 100,
      value,
      ...props
    },
    ref,
  ) => {
    const max = Number.isFinite(maxProp) && maxProp > 0 ? maxProp : 100;
    const normalizedValue =
      typeof value === 'number' &&
      Number.isFinite(value) &&
      value >= 0 &&
      value <= max
        ? value
        : 0;
    return (
      <PrimitiveView
        ref={ref}
        accessibilityRole="progressbar"
        accessibilityValue={{
          max,
          min: 0,
          now: normalizedValue,
          text: getValueLabel(normalizedValue, max),
        }}
        {...props}
      />
    );
  },
);

type IndicatorProps = SlottableViewProps;
const Indicator = React.forwardRef<ViewRef, IndicatorProps>((props, ref) => (
  <PrimitiveView ref={ref} {...props} />
));

Root.displayName = 'ProgressRoot';
Indicator.displayName = 'ProgressIndicator';

export { Indicator, Root };
export type { IndicatorProps, RootProps };

function defaultGetValueLabel(value: number, max: number) {
  return `${Math.round((value / max) * 100)}%`;
}
