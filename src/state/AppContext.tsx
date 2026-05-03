import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ChatMessage } from '../types/chat';
import type { AppSettings } from '../types/settings';
import { defaultAppSettings } from '../types/settings';
import {
  clearMessages as clearStoredMessages,
  loadMessages,
  loadSettings,
  saveMessages,
  saveSettings,
} from '../services/storage';

type AppContextValue = {
  settings: AppSettings;
  messages: ChatMessage[];
  ready: boolean;
  updateSettings: (next: Partial<AppSettings>) => Promise<void>;
  replaceSettings: (next: AppSettings) => Promise<void>;
  appendMessage: (msg: ChatMessage) => Promise<ChatMessage[]>;
  setMessages: (msgs: ChatMessage[]) => Promise<void>;
  clearChat: () => Promise<void>;
  reload: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function newId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);
  const [messages, setMessagesState] = useState<ChatMessage[]>([]);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    const [s, m] = await Promise.all([loadSettings(), loadMessages()]);
    setSettings(s);
    setMessagesState(m);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await reload();
      if (!cancelled) {
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const updateSettings = useCallback(async (next: Partial<AppSettings>) => {
    const merged = { ...settings, ...next };
    setSettings(merged);
    await saveSettings(merged);
  }, [settings]);

  const replaceSettings = useCallback(async (next: AppSettings) => {
    setSettings(next);
    await saveSettings(next);
  }, []);

  /** 使用函数式更新，避免 await 前后闭包中的 messages 过期（切 Tab / 设置更新时易丢用户气泡） */
  const appendMessage = useCallback(async (msg: ChatMessage) => {
    let next: ChatMessage[] = [];
    setMessagesState(prev => {
      next = [...prev, msg];
      return next;
    });
    await saveMessages(next);
    return next;
  }, []);

  const setMessages = useCallback(async (msgs: ChatMessage[]) => {
    setMessagesState(msgs);
    await saveMessages(msgs);
  }, []);

  const clearChat = useCallback(async () => {
    setMessagesState([]);
    await clearStoredMessages();
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      settings,
      messages,
      ready,
      updateSettings,
      replaceSettings,
      appendMessage,
      setMessages,
      clearChat,
      reload,
    }),
    [
      appendMessage,
      clearChat,
      messages,
      ready,
      reload,
      replaceSettings,
      setMessages,
      settings,
      updateSettings,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}

export { newId };
