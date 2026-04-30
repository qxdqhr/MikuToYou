import type { ChatMessage } from '../types/chat';
import type { AppSettings } from '../types/settings';

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

function chatCompletionsUrl(base: string): string {
  const b = normalizeBaseUrl(base);
  if (b.endsWith('/chat/completions')) {
    return b;
  }
  if (b.endsWith('/v1')) {
    return `${b}/chat/completions`;
  }
  return `${b}/v1/chat/completions`;
}

function toApiMessages(history: ChatMessage[]): { role: string; content: string }[] {
  return history
    .filter(m => m.role === 'user' || m.role === 'assistant' || m.role === 'system')
    .map(m => ({ role: m.role, content: m.content }));
}

export async function sendChatMessage(
  settings: AppSettings,
  history: ChatMessage[],
): Promise<string> {
  const url = chatCompletionsUrl(settings.apiBaseUrl);
  const messages = toApiMessages(history);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model || 'gpt-4o-mini',
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('响应格式异常：缺少 choices[0].message.content');
  }
  return content;
}

export async function testConnection(settings: AppSettings): Promise<void> {
  if (!settings.apiBaseUrl.trim() || !settings.apiKey.trim()) {
    throw new Error('请先填写 API Base URL 与 API Key');
  }
  await sendChatMessage(settings, [
    {
      id: 'test',
      role: 'user',
      content: 'ping',
      timestamp: Date.now(),
    },
  ]);
}
