import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from '@/components/ui/input-otp';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { TextInput } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

test('normalizes pasted input with the configured pattern and max length', async () => {
  const onChangeText = jest.fn();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <InputOTP
        maxLength={4}
        onChangeText={onChangeText}
        pattern={REGEXP_ONLY_DIGITS}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>,
    );
  });

  await ReactTestRenderer.act(() => {
    renderer?.root.findByType(TextInput).props.onChangeText('1a2 3-4');
  });

  expect(onChangeText).toHaveBeenCalledWith('1234');
});

test('renders controlled slot values', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <InputOTP
        maxLength={6}
        value="ABC123"
        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>,
    );
  });

  const firstSlot = renderer?.root.findByProps({
    accessibilityLabel: 'One-time password character 1',
  });
  const fourthSlot = renderer?.root.findByProps({
    accessibilityLabel: 'One-time password character 4',
  });

  expect(firstSlot?.findByType(Text).props.children).toBe('A');
  expect(fourthSlot?.findByType(Text).props.children).toBe('1');
});

test('marks native input and slots disabled', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <InputOTP disabled maxLength={2} value="12">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    );
  });

  expect(renderer?.root.findByType(TextInput).props.editable).toBe(false);
  expect(
    renderer?.root.findByProps({
      accessibilityLabel: 'One-time password character 1',
    }).props.disabled,
  ).toBe(true);
});

test('requires slots to be rendered inside InputOTP', () => {
  expect(() => {
    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<InputOTPSlot index={0} />);
    });
  }).toThrow('InputOTPSlot must be used within InputOTP');
});
