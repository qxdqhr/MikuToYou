import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space } from '../../theme/tokens';

type Props = {
  onGoSettings: () => void;
};

export function EmptyState({ onGoSettings }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>还没有配置 API</Text>
      <Text style={styles.hint}>
        请先到「设置」填写 API Base URL 与 API Key，然后返回聊天页开始对话。
      </Text>
      <Pressable style={styles.btn} onPress={onGoSettings}>
        <Text style={styles.btnText}>去设置</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: space.md,
    marginBottom: space.sm,
  },
  title: {
    color: colors.textMain,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: space.xs,
  },
  hint: {
    color: colors.textSub,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: space.md,
  },
  btn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.sm,
  },
  btnText: {
    color: colors.textMain,
    fontWeight: '700',
  },
});
