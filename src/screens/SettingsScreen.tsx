import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../components/layout/TopBar';
import { testConnection } from '../services/llmClient';
import { useApp } from '../state/AppContext';
import type { AppSettings } from '../types/settings';
import { defaultAppSettings } from '../types/settings';
import { colors, radius, space } from '../theme/tokens';

export function SettingsScreen() {
  const { settings, replaceSettings, clearChat, ready } = useApp();
  const [draft, setDraft] = useState<AppSettings>(defaultAppSettings);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (ready) {
      setDraft(settings);
    }
  }, [ready, settings]);

  const apiConfigured = useMemo(
    () => Boolean(draft.apiBaseUrl.trim() && draft.apiKey.trim()),
    [draft.apiBaseUrl, draft.apiKey],
  );

  const onSave = async () => {
    await replaceSettings(draft);
    Alert.alert('已保存', '设置已写入本机存储');
  };

  const onTest = async () => {
    setTesting(true);
    try {
      await testConnection(draft);
      Alert.alert('连接成功', 'API 可用（已发起最小对话请求）');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert('连接失败', msg);
    } finally {
      setTesting(false);
    }
  };

  const onClearChat = () => {
    Alert.alert('清空聊天记录', '确定删除本机全部聊天消息？', [
      { text: '取消', style: 'cancel' },
      {
        text: '清空',
        style: 'destructive',
        onPress: () => void clearChat(),
      },
    ]);
  };

  if (!ready) {
    return <View style={styles.root} />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar title="设置" apiConfigured={apiConfigured} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <Field
          label="API Base URL"
          value={draft.apiBaseUrl}
          onChangeText={v => setDraft(s => ({ ...s, apiBaseUrl: v }))}
          placeholder="https://api.openai.com/v1"
          autoCapitalize="none"
        />
        <Field
          label="API Key"
          value={draft.apiKey}
          onChangeText={v => setDraft(s => ({ ...s, apiKey: v }))}
          placeholder="sk-..."
          secureTextEntry
          autoCapitalize="none"
        />
        <Field
          label="Model"
          value={draft.model}
          onChangeText={v => setDraft(s => ({ ...s, model: v }))}
          placeholder="gpt-4o-mini"
          autoCapitalize="none"
        />
        <Field
          label="Live2D 模型地址"
          value={draft.live2dModelUrl}
          onChangeText={v => setDraft(s => ({ ...s, live2dModelUrl: v }))}
          placeholder="https://.../model.json"
          autoCapitalize="none"
        />

        <View style={styles.actions}>
          <Pressable style={styles.primary} onPress={() => void onSave()}>
            <Text style={styles.primaryText}>保存设置</Text>
          </Pressable>
          <Pressable
            style={styles.secondary}
            disabled={testing}
            onPress={() => void onTest()}>
            <Text style={styles.secondaryText}>
              {testing ? '测试中…' : '测试连接'}
            </Text>
          </Pressable>
          <Pressable style={styles.danger} onPress={onClearChat}>
            <Text style={styles.dangerText}>清空聊天记录</Text>
          </Pressable>
        </View>

        <Text style={styles.hint}>
          纯客户端直连 API 时，请妥善保管 API Key；不要提交到公开仓库。
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences';
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSub}
        style={styles.input}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    padding: space.md,
    paddingBottom: space.xl,
  },
  field: {
    marginBottom: space.md,
  },
  label: {
    color: colors.textSub,
    fontSize: 12,
    marginBottom: space.xs,
  },
  input: {
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: colors.textMain,
    paddingHorizontal: space.sm,
    paddingVertical: 10,
  },
  actions: {
    marginTop: space.sm,
    gap: space.sm,
  },
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  primaryText: {
    color: '#052421',
    fontWeight: '800',
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingVertical: 12,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  secondaryText: {
    color: colors.textMain,
    fontWeight: '700',
  },
  danger: {
    backgroundColor: 'rgba(239,68,68,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(239,68,68,0.45)',
    paddingVertical: 12,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  dangerText: {
    color: '#FECACA',
    fontWeight: '700',
  },
  hint: {
    marginTop: space.md,
    color: colors.warning,
    fontSize: 12,
    lineHeight: 16,
  },
});
