import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../components/layout/TopBar';
import {
  DEFAULT_LIVE2D_MODEL3_JSON_URL,
  DEFAULT_LLM_API_BASE_URL,
  DEFAULT_LLM_MODEL,
} from '../constants/integrationDefaults';
import { RELEASE_TAG } from '../constants/releaseTag';
import { testConnection } from '../modules/llm';
import { useApp } from '../state/AppContext';
import type { AppSettings } from '../types/settings';
import { defaultAppSettings, integrationTestPreset } from '../types/settings';
import { colors, radius, space } from '../theme/tokens';

const APP_VERSION = RELEASE_TAG;

type SubPage = 'settings' | 'about' | 'llm' | 'live2d';

export function SettingsScreen() {
  const { settings, replaceSettings, clearChat, ready } = useApp();
  const [draft, setDraft] = useState<AppSettings>(defaultAppSettings);
  const [testing, setTesting] = useState(false);
  const [page, setPage] = useState<SubPage>('settings');

  useEffect(() => {
    if (ready) {
      setDraft(settings);
    }
  }, [ready, settings]);

  const apiConfigured = useMemo(
    () => Boolean(draft.apiBaseUrl.trim() && draft.apiKey.trim()),
    [draft.apiBaseUrl, draft.apiKey],
  );

  const llmHint = useMemo(() => {
    const m = draft.model.trim();
    let line: string;
    if (!draft.apiBaseUrl.trim()) {
      line = '未填写 API 地址';
    } else {
      line = m || DEFAULT_LLM_MODEL;
    }
    if (draft.publicAppendPrompt.trim()) {
      line = `${line} · 已设附加提示`;
    }
    return line;
  }, [draft.apiBaseUrl, draft.model, draft.publicAppendPrompt]);

  const live2dHint = useMemo(() => {
    const u = draft.live2dModelUrl.trim();
    if (!u) {
      return '未填写 model3.json 地址';
    }
    return u.length > 42 ? `${u.slice(0, 40)}…` : u;
  }, [draft.live2dModelUrl]);

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

  const applyTestPreset = () => {
    setDraft(integrationTestPreset());
    Alert.alert('已填入', '已写入内置联调测试配置（可再点「保存设置」持久化）');
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
        <View>
          <Text style={styles.sectionTitle}>二级页面</Text>
          <View style={styles.sectionBody}>
            <Pressable style={styles.subEntry} onPress={() => setPage('llm')}>
              <Text style={styles.subEntryTitle}>大模型设置</Text>
              <Text style={styles.subEntryHint}>{llmHint}</Text>
            </Pressable>
            <Pressable style={styles.subEntry} onPress={() => setPage('live2d')}>
              <Text style={styles.subEntryTitle}>Live2D 模型</Text>
              <Text style={styles.subEntryHint}>{live2dHint}</Text>
            </Pressable>
            <Pressable style={styles.subEntry} onPress={() => setPage('about')}>
              <Text style={styles.subEntryTitle}>关于</Text>
              <Text style={styles.subEntryHint}>查看应用版本信息</Text>
            </Pressable>
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>操作</Text>
          <View style={styles.sectionBody}>
            <Pressable style={styles.fillTestBtn} onPress={applyTestPreset}>
              <Text style={styles.fillTestBtnText}>填入测试信息</Text>
            </Pressable>
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
          </View>
        </View>

        <Text style={styles.hint}>
          纯客户端直连 API 时，请妥善保管 API Key；不要提交到公开仓库。
        </Text>
      </ScrollView>

      <Modal
        visible={page !== 'settings'}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setPage('settings')}>
        <SafeAreaView style={styles.modalRoot} edges={['top', 'bottom']}>
          <View style={styles.subHeader}>
            <Pressable onPress={() => setPage('settings')}>
              <Text style={styles.subBack}>返回</Text>
            </Pressable>
            <Text style={styles.subTitle}>
              {page === 'about'
                ? '关于'
                : page === 'llm'
                  ? '大模型设置'
                  : 'Live2D 模型'}
            </Text>
            <View style={styles.subHeaderSpacer} />
          </View>

          {page === 'about' && (
            <View style={styles.aboutCard}>
              <Text style={styles.aboutName}>MikuToYou</Text>
              <Text style={styles.aboutVersion}>版本 {APP_VERSION}</Text>
            </View>
          )}

          {page === 'llm' && (
            <ScrollView
              style={styles.subScroll}
              contentContainerStyle={styles.subScrollContent}
              keyboardShouldPersistTaps="handled">
              <Field
                label="API Base URL"
                value={draft.apiBaseUrl}
                onChangeText={v => setDraft(s => ({ ...s, apiBaseUrl: v }))}
                placeholder={DEFAULT_LLM_API_BASE_URL}
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
                placeholder={DEFAULT_LLM_MODEL}
                autoCapitalize="none"
              />
              <Field
                label="公共附加提示词"
                value={draft.publicAppendPrompt}
                onChangeText={v =>
                  setDraft(s => ({ ...s, publicAppendPrompt: v }))
                }
                placeholder="可选；保存后，主页每条提问发往模型时都会自动附加在问题之后（聊天列表仍显示原文）"
                multiline
                autoCapitalize="none"
              />
              <Pressable
                style={styles.secondary}
                disabled={testing}
                onPress={() => void onTest()}>
                <Text style={styles.secondaryText}>
                  {testing ? '测试中…' : '测试连接'}
                </Text>
              </Pressable>
            </ScrollView>
          )}

          {page === 'live2d' && (
            <ScrollView
              style={styles.subScroll}
              contentContainerStyle={styles.subScrollContent}
              keyboardShouldPersistTaps="handled">
              <Field
                label="Live2D 模型地址（model3.json）"
                value={draft.live2dModelUrl}
                onChangeText={v => setDraft(s => ({ ...s, live2dModelUrl: v }))}
                placeholder={DEFAULT_LIVE2D_MODEL3_JSON_URL}
                autoCapitalize="none"
              />
              <Pressable
                style={styles.demoBtn}
                onPress={() =>
                  setDraft(s => ({
                    ...s,
                    live2dModelUrl: DEFAULT_LIVE2D_MODEL3_JSON_URL,
                  }))
                }>
                <Text style={styles.demoBtnText}>填入默认演示 model3（Haru）</Text>
              </Pressable>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
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
  multiline?: boolean;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize,
  multiline,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSub}
        style={[styles.input, multiline ? styles.inputMultiline : null]}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    padding: space.md,
    paddingBottom: space.xl,
    gap: space.lg,
  },
  sectionTitle: {
    color: colors.textSub,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: space.sm,
  },
  sectionBody: {
    gap: space.sm,
  },
  subScroll: {
    flex: 1,
  },
  subScrollContent: {
    padding: space.md,
    paddingBottom: space.xl,
    gap: space.sm,
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
  inputMultiline: {
    minHeight: 100,
    paddingTop: 10,
  },
  demoBtn: {
    alignSelf: 'flex-start',
    marginTop: -space.sm,
    marginBottom: space.sm,
    paddingVertical: 6,
    paddingHorizontal: space.sm,
  },
  demoBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  fillTestBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
    paddingHorizontal: space.md,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  fillTestBtnText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  actions: {
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
    color: colors.warning,
    fontSize: 12,
    lineHeight: 16,
  },
  subEntry: {
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  subEntryTitle: {
    color: colors.textMain,
    fontWeight: '700',
  },
  subEntryHint: {
    color: colors.textSub,
    fontSize: 12,
    marginTop: 4,
  },
  subHeader: {
    height: 52,
    paddingHorizontal: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  subBack: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  subTitle: {
    color: colors.textMain,
    fontSize: 17,
    fontWeight: '700',
  },
  subHeaderSpacer: {
    width: 30,
  },
  aboutCard: {
    margin: space.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    padding: space.md,
  },
  aboutName: {
    color: colors.textMain,
    fontSize: 16,
    fontWeight: '800',
  },
  aboutVersion: {
    marginTop: space.xs,
    color: colors.textSub,
    fontSize: 13,
  },
});
