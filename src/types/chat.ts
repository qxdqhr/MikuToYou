export type ChatRole = 'user' | 'assistant' | 'system' | 'error';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}
