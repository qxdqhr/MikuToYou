import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../components/layout/TopBar';
import type { PersonalityPreset } from '../modules/personality';
import { newId, useApp } from '../state/AppContext';
import { colors, radius, space } from '../theme/tokens';

export function PersonalityScreen() {
  const {
    settings,
    ready,
    updateSettings,
    clearChat,
  } = useApp();
  const { width } = useWindowDimensions();
  const [editing, setEditing] = useState<PersonalityPreset | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftPrompt, setDraftPrompt] = useState('');

  const apiConfigured = useMemo(
    () => Boolean(settings.apiBaseUrl.trim() && settings.apiKey.trim()),
    [settings.apiBaseUrl, settings.apiKey],
  );

  const gap = space.sm;
  const horizontalPad = space.md * 2;
  const colW = Math.max(
    140,
    Math.floor((width - horizontalPad - gap) / 2),
  );

  const openEdit = useCallback((p: PersonalityPreset) => {
    setEditing(p);
    setDraftTitle(p.title);
    setDraftPrompt(p.systemPrompt);
  }, []);

  const closeEdit = useCallback(() => {
    setEditing(null);
  }, []);

  const selectPersonality = useCallback(
    async (id: string | null) => {
      if (id === settings.activePersonalityId) {
        return;
      }
      await clearChat();
      await updateSettings({ activePersonalityId: id });
    },
    [clearChat, settings.activePersonalityId, updateSettings],
  );

  const onSaveEdit = useCallback(async () => {
    if (!editing) {
      return;
    }
    const title = draftTitle.trim();
    if (!title) {
      Alert.alert('无法保存', '请填写标题');
      return;
    }
    const next = settings.personalityPresets.map(p =>
      p.id === editing.id
        ? {
            ...p,
            title,
            systemPrompt: draftPrompt,
          }
        : p,
    );
    await updateSettings({ personalityPresets: next });
    closeEdit();
  }, [
    closeEdit,
    draftPrompt,
    draftTitle,
    editing,
    settings.personalityPresets,
    updateSettings,
  ]);

  const onDeleteEditing = useCallback(() => {
    if (!editing) {
      return;
    }
    Alert.alert('删除人格', `确定删除「${editing.title}」？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            const next = settings.personalityPresets.filter(
              p => p.id !== editing.id,
            );
            let active = settings.activePersonalityId;
            const wasActive = active === editing.id;
            if (wasActive) {
              active = next[0]?.id ?? null;
              await clearChat();
            }
            await updateSettings({
              personalityPresets: next,
              activePersonalityId: active,
            });
            closeEdit();
          })();
        },
      },
    ]);
  }, [
    clearChat,
    closeEdit,
    editing,
    settings.activePersonalityId,
    settings.personalityPresets,
    updateSettings,
  ]);

  const onAddPreset = useCallback(async () => {
    const p: PersonalityPreset = {
      id: newId(),
      title: '新人格',
      systemPrompt: '',
    };
    await updateSettings({
      personalityPresets: [...settings.personalityPresets, p],
    });
    openEdit(p);
  }, [openEdit, settings.personalityPresets, updateSettings]);

  if (!ready) {
    return <View style={styles.root} />;
  }

  const isNoneActive = settings.activePersonalityId == null;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar title="人格 / 预置提示词" apiConfigured={apiConfigured} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.hint}>
          切换人格会先清空聊天记录，再注入新的系统提示（不写入本地消息列表）。
        </Text>

        <Pressable
          onPress={() => void selectPersonality(null)}
          style={[styles.noneCard, isNoneActive && styles.tileActive]}>
          <Text style={styles.noneTitle}>不使用系统提示词</Text>
          <Text style={styles.noneSub}>仅发送对话中的 user / assistant 内容</Text>
        </Pressable>

        <View style={[styles.grid, { paddingHorizontal: space.md, gap }]}>
          {settings.personalityPresets.map(p => {
            const active = settings.activePersonalityId === p.id;
            return (
              <View
                key={p.id}
                style={[
                  styles.tile,
                  { width: colW },
                  active && styles.tileActive,
                ]}>
                <Pressable
                  style={styles.tileMain}
                  onPress={() => void selectPersonality(p.id)}>
                  <Text style={styles.tileTitle} numberOfLines={2}>
                    {p.title}
                  </Text>
                  <Text
                    style={styles.tilePreview}
                    numberOfLines={3}
                    ellipsizeMode="tail">
                    {p.systemPrompt.trim() || '（未填写系统提示）'}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.editLink}
                  onPress={() => openEdit(p)}
                  hitSlop={8}>
                  <Text style={styles.editLinkText}>编辑</Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        <Pressable style={styles.addBtn} onPress={() => void onAddPreset()}>
          <Text style={styles.addBtnText}>＋ 新增人格</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={editing != null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeEdit}>
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView style={styles.modalRoot} edges={['top', 'bottom']}>
            <View style={styles.modalHeader}>
              <Pressable onPress={closeEdit}>
                <Text style={styles.modalCancel}>取消</Text>
              </Pressable>
              <Text style={styles.modalTitle}>编辑人格</Text>
              <Pressable onPress={() => void onSaveEdit()}>
                <Text style={styles.modalSave}>保存</Text>
              </Pressable>
            </View>
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled">
              <Text style={styles.fieldLabel}>标题</Text>
              <TextInput
                value={draftTitle}
                onChangeText={setDraftTitle}
                placeholder="显示在网格中的名称"
                placeholderTextColor={colors.textSub}
                style={styles.input}
              />
              <Text style={styles.fieldLabel}>系统提示词（人格）</Text>
              <TextInput
                value={draftPrompt}
                onChangeText={setDraftPrompt}
                placeholder="注入为 API 的 system 消息…"
                placeholderTextColor={colors.textSub}
                style={[styles.input, styles.inputMultiline]}
                multiline
                textAlignVertical="top"
              />
              <Pressable
                style={styles.deleteBtn}
                onPress={onDeleteEditing}>
                <Text style={styles.deleteBtnText}>删除此人格</Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    paddingBottom: space.xl,
  },
  hint: {
    marginHorizontal: space.md,
    marginBottom: space.sm,
    color: colors.textSub,
    fontSize: 12,
    lineHeight: 17,
  },
  noneCard: {
    marginHorizontal: space.md,
    marginBottom: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  noneTitle: {
    color: colors.textMain,
    fontWeight: '700',
    fontSize: 15,
  },
  noneSub: {
    marginTop: 4,
    color: colors.textSub,
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tile: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: space.sm,
    overflow: 'hidden',
  },
  tileActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(57,197,187,0.12)',
  },
  tileMain: {
    padding: space.sm,
    minHeight: 100,
  },
  tileTitle: {
    color: colors.textMain,
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 6,
  },
  tilePreview: {
    color: colors.textSub,
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  editLink: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingVertical: 8,
    alignItems: 'center',
  },
  editLinkText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  addBtn: {
    marginTop: space.md,
    marginHorizontal: space.md,
    paddingVertical: 12,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  addBtnText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    height: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  modalCancel: {
    color: colors.textSub,
    fontSize: 16,
  },
  modalTitle: {
    color: colors.textMain,
    fontWeight: '700',
    fontSize: 17,
  },
  modalSave: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 16,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: space.md,
    paddingBottom: space.xl,
  },
  fieldLabel: {
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
    marginBottom: space.md,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 160,
  },
  deleteBtn: {
    marginTop: space.sm,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(239,68,68,0.45)',
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  deleteBtnText: {
    color: '#FECACA',
    fontWeight: '700',
  },
});
