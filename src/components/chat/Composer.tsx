import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, radius, space } from '../../theme/tokens';

type Props = {
  disabled?: boolean;
  onSend: (text: string) => void;
};

export function Composer({ disabled, onSend }: Props) {
  const [text, setText] = useState('');

  const submit = () => {
    const t = text.trim();
    if (!t || disabled) {
      return;
    }
    onSend(t);
    setText('');
  };

  return (
    <View style={styles.row}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="输入你的问题..."
        placeholderTextColor={colors.textSub}
        style={styles.input}
        multiline
        editable={!disabled}
      />
      <Pressable
        onPress={submit}
        disabled={disabled || !text.trim()}
        style={({ pressed }) => [
          styles.send,
          (disabled || !text.trim()) && styles.sendDisabled,
          pressed && styles.sendPressed,
        ]}>
        <Text style={styles.sendText}>{disabled ? '发送中…' : '发送'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.xs,
    marginTop: space.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: colors.textMain,
    paddingHorizontal: space.sm,
    paddingVertical: 10,
  },
  send: {
    backgroundColor: colors.primary,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    borderRadius: radius.sm,
  },
  sendPressed: {
    opacity: 0.9,
  },
  sendDisabled: {
    opacity: 0.45,
  },
  sendText: {
    color: '#052421',
    fontWeight: '700',
  },
});
