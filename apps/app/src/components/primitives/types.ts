import type * as React from 'react';
import type {
  Pressable,
  PressableProps,
  Text,
  TextProps,
  View,
  ViewProps,
} from 'react-native';

type AsChildProps = {
  asChild?: boolean;
};

type ForceMountable = {
  forceMount?: true;
};

type SlottableViewProps = ViewProps & AsChildProps;
type SlottableTextProps = TextProps & AsChildProps;
type SlottablePressableProps = PressableProps & AsChildProps;

type PositionedContentProps = {
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  avoidCollisions?: boolean;
  disablePositioningStyle?: boolean;
  insets?: Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
};

type ViewRef = React.ElementRef<typeof View>;
type TextRef = React.ElementRef<typeof Text>;
type PressableRef = React.ElementRef<typeof Pressable>;

export type {
  AsChildProps,
  ForceMountable,
  PositionedContentProps,
  PressableRef,
  SlottablePressableProps,
  SlottableTextProps,
  SlottableViewProps,
  TextRef,
  ViewRef,
};
