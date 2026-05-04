import { DEFAULT_LLM_MODEL } from '../../constants/integrationDefaults';
import type { ChatMessage } from '../../types/chat';
import type { AppSettings } from '../../types/settings';
import { buildLlmMessageList } from './context';

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

function toApiMessages(
  history: ChatMessage[],
  settings: AppSettings,
): { role: string; content: string }[] {
  const append = settings.publicAppendPrompt.trim();
  return history
    .filter(
      m =>
        m.role === 'user' ||
        m.role === 'assistant' ||
        m.role === 'system',
    )
    .map(m => {
      if (m.role === 'user' && append) {
        return { role: m.role, content: `${m.content}\n\n${append}` };
      }
      return { role: m.role, content: m.content };
    });
}

export async function sendChatMessage(
  settings: AppSettings,
  conversation: ChatMessage[],
): Promise<string> {
  const url = chatCompletionsUrl(settings.apiBaseUrl);
  const messages = toApiMessages(
    buildLlmMessageList(settings, conversation),
    settings,
  );

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model.trim() || DEFAULT_LLM_MODEL,
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
