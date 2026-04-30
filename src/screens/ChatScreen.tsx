import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Composer } from '../components/chat/Composer';
import { Live2DPanel } from '../components/chat/Live2DPanel';
import { MessageList } from '../components/chat/MessageList';
import { EmptyState } from '../components/feedback/EmptyState';
import { TopBar } from '../components/layout/TopBar';
import type { RootTabParamList } from '../navigation/RootTabs';
import { sendChatMessage } from '../services/llmClient';
import { newId, useApp } from '../state/AppContext';
import { colors } from '../theme/tokens';

type Nav = BottomTabNavigationProp<RootTabParamList, 'Chat'>;

export function ChatScreen() {
  const navigation = useNavigation<Nav>();
  const { settings, messages, appendMessage, ready } = useApp();
  const [sending, setSending] = useState(false);

  const apiConfigured = useMemo(
    () => Boolean(settings.apiBaseUrl.trim() && settings.apiKey.trim()),
    [settings.apiBaseUrl, settings.apiKey],
  );

  const onSend = useCallback(
    async (text: string) => {
      if (!apiConfigured) {
        return;
      }
      const userMsg = {
        id: newId(),
        role: 'user' as const,
        content: text,
        timestamp: Date.now(),
      };
      await appendMessage(userMsg);
      setSending(true);
      try {
        const nextHistory = [...messages, userMsg];
        const reply = await sendChatMessage(settings, nextHistory);
        await appendMessage({
          id: newId(),
          role: 'assistant',
          content: reply,
          timestamp: Date.now(),
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        await appendMessage({
          id: newId(),
          role: 'error',
          content: `请求失败：${msg}`,
          timestamp: Date.now(),
        });
      } finally {
        setSending(false);
      }
    },
    [apiConfigured, appendMessage, messages, settings],
  );

  if (!ready) {
    return <View style={styles.root} />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar title="MikuToYou" apiConfigured={apiConfigured} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <View style={styles.body}>
          {!apiConfigured ? (
            <EmptyState onGoSettings={() => navigation.navigate('Settings')} />
          ) : null}
          <Live2DPanel modelUrl={settings.live2dModelUrl} />
          <MessageList messages={messages} />
          <Composer disabled={!apiConfigured || sending} onSend={onSend} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
});
