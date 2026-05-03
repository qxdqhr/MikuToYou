export interface PersonalityPreset {
  id: string;
  title: string;
  /** 作为 Chat Completions 的 system 消息注入，不写入本地聊天记录 */
  systemPrompt: string;
}
