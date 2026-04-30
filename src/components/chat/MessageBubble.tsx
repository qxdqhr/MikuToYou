import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ChatMessage } from '../../types/chat';
import { colors, radius, space } from '../../theme/tokens';

type Props = {
  message: ChatMessage;
};

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';

  return (
    <View
      style={[
        styles.wrap,
        isUser ? styles.alignEnd : styles.alignStart,
      ]}>
      <View
        style={[
          styles.bubble,
          isUser && styles.bubbleUser,
          !isUser && !isError && styles.bubbleAssistant,
          isError && styles.bubbleError,
        ]}>
        <Text style={[styles.text, isError && styles.textError]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: space.sm,
    width: '100%',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '86%',
    paddingVertical: 10,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
  },
  bubbleUser: {
    backgroundColor: 'rgba(57,197,187,0.2)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(57,197,187,0.55)',
  },
  bubbleAssistant: {
    backgroundColor: colors.panelStrong,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  bubbleError: {
    backgroundColor: 'rgba(239,68,68,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(239,68,68,0.45)',
  },
  text: {
    color: colors.textMain,
    fontSize: 14,
    lineHeight: 20,
  },
  textError: {
    color: '#FECACA',
  },
});
