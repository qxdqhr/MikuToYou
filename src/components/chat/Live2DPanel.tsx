import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, radius, space } from '../../theme/tokens';
import {
  buildLive2dPlaceholderHtml,
  buildLive2dViewerHtml,
  live2dWebViewBaseUrl,
} from './live2dViewer';

type Props = {
  modelUrl: string;
};

export function Live2DPanel({ modelUrl }: Props) {
  const [failed, setFailed] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const trimmed = modelUrl.trim();
  const baseUrl = useMemo(() => live2dWebViewBaseUrl(trimmed), [trimmed]);

  const html = useMemo(
    () =>
      trimmed ? buildLive2dViewerHtml(trimmed) : buildLive2dPlaceholderHtml(),
    [trimmed],
  );

  const webKey = useMemo(
    () => `${trimmed || 'placeholder'}-${failed ? 'f' : 'ok'}`,
    [trimmed, failed],
  );

  const onMessage = useCallback((e: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(e.nativeEvent.data) as {
        type?: string;
        message?: string;
      };
      if (data.type === 'live2d-loaded') {
        setFailed(false);
        setHint(null);
      } else if (data.type === 'live2d-empty') {
        setFailed(false);
        setHint(null);
      } else if (data.type === 'live2d-error') {
        setFailed(true);
        setHint(data.message ?? '未知错误');
      }
    } catch {
      // ignore
    }
  }, []);

  const onError = useCallback(() => {
    setFailed(true);
    setHint('WebView 渲染错误');
  }, []);

  if (failed) {
    return (
      <View style={styles.panel}>
        <Text style={styles.failTitle}>Live2D 加载失败</Text>
        {hint ? <Text style={styles.failDetail}>{hint}</Text> : null}
        <Text style={styles.failHint}>
          请确认地址为可访问的 model3.json，且资源站允许跨域（CORS）。可换用演示模型
          地址在设置页占位中复制。
        </Text>
        <Pressable style={styles.retry} onPress={() => setFailed(false)}>
          <Text style={styles.retryText}>重试</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <WebView
        key={webKey}
        originWhitelist={['*']}
        source={{ html, baseUrl }}
        onMessage={onMessage}
        onError={onError}
        style={styles.webview}
        setSupportMultipleWindows={false}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="always"
        thirdPartyCookiesEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    height: 220,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.panel,
  },
  webview: {
    flex: 1,
    height: '100%',
    backgroundColor: 'transparent',
  },
  failTitle: {
    color: colors.textMain,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: space.md,
    paddingHorizontal: space.sm,
  },
  failDetail: {
    color: '#fecaca',
    textAlign: 'center',
    marginTop: space.xs,
    fontSize: 12,
    paddingHorizontal: space.md,
  },
  failHint: {
    color: colors.textSub,
    textAlign: 'center',
    marginTop: space.sm,
    marginBottom: space.sm,
    fontSize: 11,
    lineHeight: 15,
    paddingHorizontal: space.md,
  },
  retry: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.sm,
    marginBottom: space.md,
  },
  retryText: {
    color: colors.textMain,
    fontWeight: '600',
  },
});
