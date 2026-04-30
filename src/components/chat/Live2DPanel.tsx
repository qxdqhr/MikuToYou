import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, radius, space } from '../../theme/tokens';

type Props = {
  modelUrl: string;
};

function buildHtml(modelUrl: string): string {
  const safe = modelUrl.replace(/</g, '\\u003c');
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #0b1220;
      color: #94a3b8;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      text-align: center;
      padding: 16px;
      max-width: 92vw;
    }
    .tag { color: #39c5bb; font-weight: 600; font-size: 13px; margin-bottom: 8px; }
    .url { font-size: 11px; word-break: break-all; opacity: 0.85; }
  </style>
</head>
<body>
  <div class="card">
    <div class="tag">Live2D WebView 占位（MVP）</div>
    <div>后续在此注入 Pixi + Cubism 运行时加载 model.json</div>
    <div class="url">${safe || '（未配置模型地址）'}</div>
  </div>
  <script>
    (function () {
      function post(obj) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(obj));
        }
      }
      window.addEventListener('load', function () {
        post({ type: 'live2d-ready', modelUrl: ${JSON.stringify(modelUrl)} });
      });
    })();
  </script>
</body>
</html>`;
}

export function Live2DPanel({ modelUrl }: Props) {
  const [failed, setFailed] = useState(false);
  const html = useMemo(() => buildHtml(modelUrl), [modelUrl]);

  const onMessage = useCallback((e: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(e.nativeEvent.data) as { type?: string };
      if (data.type === 'live2d-ready') {
        setFailed(false);
      }
    } catch {
      // ignore
    }
  }, []);

  const onError = useCallback(() => setFailed(true), []);

  if (failed) {
    return (
      <View style={styles.panel}>
        <Text style={styles.failTitle}>Live2D 加载失败</Text>
        <Text style={styles.failHint}>请检查网络或模型地址</Text>
        <Pressable style={styles.retry} onPress={() => setFailed(false)}>
          <Text style={styles.retryText}>重试</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        onMessage={onMessage}
        onError={onError}
        style={styles.webview}
        setSupportMultipleWindows={false}
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
    marginTop: space.lg,
  },
  failHint: {
    color: colors.textSub,
    textAlign: 'center',
    marginTop: space.sm,
    marginBottom: space.md,
  },
  retry: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.sm,
    marginBottom: space.lg,
  },
  retryText: {
    color: colors.textMain,
    fontWeight: '600',
  },
});
