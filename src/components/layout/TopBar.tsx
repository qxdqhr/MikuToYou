import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, space } from '../../theme/tokens';

type Props = {
  title: string;
  apiConfigured: boolean;
};

export function TopBar({ title, apiConfigured }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.status}>
        <View
          style={[styles.dot, !apiConfigured && styles.dotOffline]}
          accessibilityLabel={apiConfigured ? 'API 已配置' : 'API 未配置'}
        />
        <Text style={styles.statusText}>
          {apiConfigured ? 'API 已配置' : 'API 未配置'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 52,
    paddingHorizontal: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.textMain,
    fontSize: 17,
    fontWeight: '700',
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  dotOffline: {
    backgroundColor: colors.warning,
  },
  statusText: {
    color: colors.textSub,
    fontSize: 12,
  },
});
