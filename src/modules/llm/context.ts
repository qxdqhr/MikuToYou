import type { ChatMessage } from '../../types/chat';
import type { AppSettings } from '../../types/settings';

/**
 * 将本地对话与当前选用的人格合并为发往 API 的消息列表。
 * - user / assistant 来自持久化；system 仅由人格模块配置的预置提示词注入。
 */
export function buildLlmMessageList(
  settings: AppSettings,
  conversation: ChatMessage[],
): ChatMessage[] {
  const dialogue = conversation.filter(
    m =>
      m.role === 'user' ||
      m.role === 'assistant' ||
      m.role === 'system',
  );
  const withoutInjectedSystem = dialogue.filter(m => m.role !== 'system');

  const preset = settings.personalityPresets.find(
    p => p.id === settings.activePersonalityId,
  );
  const systemText = preset?.systemPrompt?.trim() ?? '';
  if (!systemText) {
    return withoutInjectedSystem;
  }

  return [
    {
      id: '__injected_system__',
      role: 'system',
      content: systemText,
      timestamp: 0,
    },
    ...withoutInjectedSystem,
  ];
}
