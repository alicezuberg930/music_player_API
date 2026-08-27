import type { LayoutRectangle, ViewStyle } from 'react-native';
import type { PositionedContentProps } from './types';

type Size = {
  height: number;
  width: number;
};

type PositionInput = PositionedContentProps & {
  anchor: LayoutRectangle | null;
  content: Size | null;
  screen: Size;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function getPosition({
  align = 'start',
  alignOffset = 0,
  anchor,
  avoidCollisions = true,
  content,
  disablePositioningStyle,
  insets,
  screen,
  side = 'bottom',
  sideOffset = 0,
}: PositionInput): ViewStyle {
  if (disablePositioningStyle) {
    return {};
  }

  if (!anchor || !content) {
    return { position: 'absolute', opacity: 0, left: -10000, top: -10000 };
  }

  const topInset = insets?.top ?? 8;
  const rightInset = insets?.right ?? 8;
  const bottomInset = insets?.bottom ?? 8;
  const leftInset = insets?.left ?? 8;
  let left = anchor.x;
  let top = anchor.y + anchor.height + sideOffset;

  if (side === 'top') {
    top = anchor.y - content.height - sideOffset;
  } else if (side === 'left') {
    left = anchor.x - content.width - sideOffset;
    top = anchor.y;
  } else if (side === 'right') {
    left = anchor.x + anchor.width + sideOffset;
    top = anchor.y;
  }

  if (side === 'top' || side === 'bottom') {
    if (align === 'center') {
      left = anchor.x + (anchor.width - content.width) / 2;
    } else if (align === 'end') {
      left = anchor.x + anchor.width - content.width;
    }
    left += alignOffset;
  } else {
    if (align === 'center') {
      top = anchor.y + (anchor.height - content.height) / 2;
    } else if (align === 'end') {
      top = anchor.y + anchor.height - content.height;
    }
    top += alignOffset;
  }

  if (avoidCollisions) {
    left = clamp(left, leftInset, screen.width - rightInset - content.width);
    top = clamp(top, topInset, screen.height - bottomInset - content.height);
  }

  return {
    left,
    maxHeight: screen.height - topInset - bottomInset,
    maxWidth: screen.width - leftInset - rightInset,
    position: 'absolute',
    top,
  };
}

export { getPosition };
export type { Size };
