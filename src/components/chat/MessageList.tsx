import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import type { ChatMessage } from '../../types/chat';
import { colors, space } from '../../theme/tokens';
import { MessageBubble } from './MessageBubble';

type Props = {
  messages: ChatMessage[];
};

export function MessageList({ messages }: Props) {
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const isFocused = useIsFocused();
  const tailId = messages[messages.length - 1]?.id;

  useEffect(() => {
    if (!isFocused || messages.length === 0) {
      return;
    }
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [isFocused, messages.length, tailId]);

  const renderItem: ListRenderItem<ChatMessage> = ({ item }) => (
    <MessageBubble message={item} />
  );

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.panel,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  content: {
    padding: space.sm,
    paddingBottom: space.md,
  },
});
