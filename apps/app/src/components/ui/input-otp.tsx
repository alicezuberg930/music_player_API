import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import {
  Platform,
  Pressable,
  TextInput,
  View,
  type TextInputKeyPressEvent,
} from 'react-native';

const REGEXP_ONLY_DIGITS = /^\d+$/;
const REGEXP_ONLY_DIGITS_AND_CHARS = /^[a-zA-Z0-9]+$/;

type InputOTPContextValue = {
  disabled: boolean;
  focused: boolean;
  invalid: boolean;
  maxLength: number;
  press: () => void;
  value: string;
};

const InputOTPContext = React.createContext<InputOTPContextValue | null>(null);

type InputOTPProps = Omit<
  React.ComponentProps<typeof TextInput>,
  | 'defaultValue'
  | 'editable'
  | 'maxLength'
  | 'onChange'
  | 'onChangeText'
  | 'value'
> & {
  children: React.ReactNode;
  defaultValue?: string;
  disabled?: boolean;
  invalid?: boolean;
  maxLength: number;
  onChange?: (value: string) => void;
  onChangeText?: (value: string) => void;
  pattern?: RegExp;
  value?: string;
};

function normalizeValue(value: string, maxLength: number, pattern?: RegExp) {
  const characters = Array.from(value).filter(character => {
    if (!pattern) return true;
    pattern.lastIndex = 0;
    return pattern.test(character);
  });

  return characters.join('').slice(0, maxLength);
}

function InputOTP({
  children,
  className,
  defaultValue = '',
  disabled = false,
  invalid = false,
  maxLength,
  onBlur,
  onChange,
  onChangeText,
  onFocus,
  onKeyPress,
  pattern,
  value,
  ...props
}: InputOTPProps) {
  const inputRef = React.useRef<React.ElementRef<typeof TextInput>>(null);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState(() =>
    normalizeValue(defaultValue, maxLength, pattern),
  );
  const [focused, setFocused] = React.useState(false);
  const currentValue = normalizeValue(
    isControlled ? value : internalValue,
    maxLength,
    pattern,
  );

  const updateValue = React.useCallback(
    (nextValue: string) => {
      const normalizedValue = normalizeValue(nextValue, maxLength, pattern);
      if (!isControlled) setInternalValue(normalizedValue);
      onChange?.(normalizedValue);
      onChangeText?.(normalizedValue);
    },
    [isControlled, maxLength, onChange, onChangeText, pattern],
  );

  const press = React.useCallback(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const handleKeyPress = React.useCallback(
    (event: TextInputKeyPressEvent) => {
      if (event.nativeEvent.key === 'Backspace' && currentValue.length > 0) {
        updateValue(currentValue.slice(0, -1));
      }
      onKeyPress?.(event);
    },
    [currentValue, onKeyPress, updateValue],
  );

  return (
    <InputOTPContext.Provider
      value={{
        disabled,
        focused,
        invalid,
        maxLength,
        press,
        value: currentValue,
      }}
    >
      <Pressable
        accessibilityRole="text"
        accessibilityState={{ disabled }}
        className={cn('relative flex-row items-center gap-2', className)}
        disabled={disabled}
        onPress={press}
      >
        {children}
        <TextInput
          autoComplete="one-time-code"
          caretHidden
          className="absolute inset-0 opacity-0"
          contextMenuHidden={false}
          editable={!disabled}
          importantForAccessibility="no-hide-descendants"
          keyboardType="number-pad"
          maxLength={maxLength}
          onBlur={event => {
            setFocused(false);
            onBlur?.(event);
          }}
          onChangeText={updateValue}
          onFocus={event => {
            setFocused(true);
            onFocus?.(event);
          }}
          onKeyPress={handleKeyPress}
          ref={inputRef}
          textContentType="oneTimeCode"
          value={currentValue}
          {...props}
        />
      </Pressable>
    </InputOTPContext.Provider>
  );
}

type InputOTPGroupProps = React.ComponentProps<typeof View> &
  React.RefAttributes<View>;

function InputOTPGroup({ className, ...props }: InputOTPGroupProps) {
  return (
    <View
      className={cn('flex-row items-center', className)}
      pointerEvents="none"
      {...props}
    />
  );
}

type InputOTPSlotProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<View> & {
    index: number;
    invalid?: boolean;
  };

function InputOTPSlot({
  className,
  index,
  invalid,
  ...props
}: InputOTPSlotProps) {
  const context = React.useContext(InputOTPContext);
  if (!context) {
    throw new Error('InputOTPSlot must be used within InputOTP');
  }

  const character = context.value[index] ?? '';
  const isActive =
    context.focused &&
    !context.disabled &&
    index === Math.min(context.value.length, context.maxLength - 1);
  const isInvalid = invalid ?? context.invalid;

  return (
    <Pressable
      accessibilityLabel={`One-time password character ${index + 1}`}
      accessibilityRole="text"
      accessibilityState={{ disabled: context.disabled }}
      aria-invalid={isInvalid}
      className={cn(
        'border-input bg-background relative h-10 w-10 items-center justify-center border-y border-r shadow-sm shadow-black/5',
        index === 0 && 'rounded-l-md border-l',
        index === context.maxLength - 1 && 'rounded-r-md',
        isActive && 'border-ring z-10 ring-2 ring-ring/50',
        isInvalid && 'border-destructive ring-2 ring-destructive/20',
        context.disabled && 'opacity-50',
        Platform.select({
          web: 'transition-all',
        }),
        className,
      )}
      disabled={context.disabled}
      onPress={context.press}
      {...props}
    >
      <Text className="text-center text-base font-medium leading-none">
        {character}
      </Text>
      {isActive && !character ? (
        <View className="bg-foreground h-4 w-px" testID="input-otp-caret" />
      ) : null}
    </Pressable>
  );
}

type InputOTPSeparatorProps = React.ComponentProps<typeof View> &
  React.RefAttributes<View>;

function InputOTPSeparator({ className, ...props }: InputOTPSeparatorProps) {
  return (
    <View
      accessibilityElementsHidden
      className={cn('items-center justify-center px-2', className)}
      importantForAccessibility="no"
      pointerEvents="none"
      {...props}
    >
      <Text className="text-muted-foreground text-lg leading-none">-</Text>
    </View>
  );
}

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
};
export type { InputOTPProps };
