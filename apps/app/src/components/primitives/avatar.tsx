import * as React from 'react';
import {
  Image as NativeImage,
  type ImageSourcePropType,
  type ImageURISource,
} from 'react-native';
import { PrimitiveView } from './primitive';
import { Slot } from './slot';
import type { AsChildProps, SlottableViewProps, ViewRef } from './types';

type LoadingStatus = 'error' | 'loaded' | 'loading';
type AvatarContextValue = {
  alt: string;
  setStatus: (status: LoadingStatus) => void;
  status: LoadingStatus;
};

const AvatarContext = React.createContext<AvatarContextValue | null>(null);

function useAvatarContext() {
  const context = React.useContext(AvatarContext);
  if (!context) {
    throw new Error(
      'Avatar compound components must be rendered inside Avatar.Root',
    );
  }
  return context;
}

type RootProps = SlottableViewProps & {
  alt: string;
};

const Root = React.forwardRef<ViewRef, RootProps>(
  ({ alt, children, ...props }, ref) => {
    const [status, setStatus] = React.useState<LoadingStatus>('error');
    const value = React.useMemo(
      () => ({ alt, setStatus, status }),
      [alt, status],
    );

    return (
      <AvatarContext.Provider value={value}>
        <PrimitiveView ref={ref} accessibilityLabel={alt} {...props}>
          {children}
        </PrimitiveView>
      </AvatarContext.Provider>
    );
  },
);

type ImageProps = React.ComponentPropsWithoutRef<typeof NativeImage> &
  AsChildProps & {
    onLoadingStatusChange?: (status: 'error' | 'loaded') => void;
  };

const Image = React.forwardRef<
  React.ElementRef<typeof NativeImage>,
  ImageProps
>(({ asChild, onError, onLoad, onLoadingStatusChange, ...props }, ref) => {
  const { alt, setStatus, status } = useAvatarContext();
  const Component = asChild ? Slot : NativeImage;

  React.useEffect(() => {
    setStatus(isValidSource(props.source) ? 'loading' : 'error');
    return () => setStatus('error');
  }, [props.source, setStatus]);

  if (status === 'error') {
    return null;
  }

  return (
    <Component
      ref={ref}
      accessibilityLabel={alt}
      onError={(event: unknown) => {
        setStatus('error');
        onLoadingStatusChange?.('error');
        onError?.(event as Parameters<NonNullable<typeof onError>>[0]);
      }}
      onLoad={(event: unknown) => {
        setStatus('loaded');
        onLoadingStatusChange?.('loaded');
        onLoad?.(event as Parameters<NonNullable<typeof onLoad>>[0]);
      }}
      {...props}
    />
  );
});

type FallbackProps = SlottableViewProps;

const Fallback = React.forwardRef<ViewRef, FallbackProps>((props, ref) => {
  const { status } = useAvatarContext();
  if (status !== 'error') {
    return null;
  }
  return <PrimitiveView ref={ref} accessibilityRole="image" {...props} />;
});

Root.displayName = 'AvatarRoot';
Image.displayName = 'AvatarImage';
Fallback.displayName = 'AvatarFallback';

export { Fallback, Image, Root };
export type { FallbackProps, ImageProps, RootProps };

function isValidSource(source: ImageSourcePropType | undefined) {
  if (
    !source ||
    (typeof source === 'object' && 'uri' in source && !source.uri)
  ) {
    return false;
  }
  if (typeof source === 'number') {
    return true;
  }
  if (Array.isArray(source)) {
    return source.some(entry => Boolean(entry.uri));
  }
  return Boolean((source as ImageURISource).uri);
}
