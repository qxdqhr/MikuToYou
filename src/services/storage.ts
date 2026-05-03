import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatMessage } from '../types/chat';
import type { AppSettings } from '../types/settings';
import { defaultAppSettings, normalizeAppSettings } from '../types/settings';

const SETTINGS_KEY = 'mikutoyou:settings:v1';
const MESSAGES_KEY = 'mikutoyou:messages:v1';

export async function loadSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return normalizeAppSettings({});
  }
  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return normalizeAppSettings({ ...defaultAppSettings, ...parsed });
  } catch {
    return normalizeAppSettings({});
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function loadMessages(): Promise<ChatMessage[]> {
  const raw = await AsyncStorage.getItem(MESSAGES_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveMessages(messages: ChatMessage[]): Promise<void> {
  await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export async function clearMessages(): Promise<void> {
  await AsyncStorage.removeItem(MESSAGES_KEY);
}
