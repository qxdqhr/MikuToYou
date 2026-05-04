import {
  DEFAULT_LIVE2D_MODEL3_JSON_URL,
  DEFAULT_LLM_API_BASE_URL,
  DEFAULT_LLM_MODEL,
  DEV_SILICONFLOW_TEST_API_KEY,
} from '../constants/integrationDefaults';
import {
  DEFAULT_PERSONALITY_PRESETS,
  ensurePersonalityFields,
  type PersonalityPreset,
} from '../modules/personality';

export type { PersonalityPreset } from '../modules/personality';

export interface AppSettings {
  apiBaseUrl: string;
  apiKey: string;
  model: string;
  /** 公共附加提示词：发往 LLM 时追加在每条用户消息之后；聊天记录中仍为原文 */
  publicAppendPrompt: string;
  live2dModelUrl: string;
  /** 预置人格（仅 system 注入，不落库到聊天记录） */
  personalityPresets: PersonalityPreset[];
  /** 当前选用的人格 id；null 表示不注入系统提示 */
  activePersonalityId: string | null;
}

export const defaultAppSettings: AppSettings = {
  apiBaseUrl: DEFAULT_LLM_API_BASE_URL,
  apiKey: DEV_SILICONFLOW_TEST_API_KEY,
  model: DEFAULT_LLM_MODEL,
  publicAppendPrompt: '',
  live2dModelUrl: DEFAULT_LIVE2D_MODEL3_JSON_URL,
  personalityPresets: DEFAULT_PERSONALITY_PRESETS.map(p => ({ ...p })),
  activePersonalityId: DEFAULT_PERSONALITY_PRESETS[0]?.id ?? null,
};

/** 合并存储数据并修复缺失/损坏的人格字段 */
export function normalizeAppSettings(
  partial: Partial<AppSettings>,
): AppSettings {
  const merged: AppSettings = { ...defaultAppSettings, ...partial };
  const p = ensurePersonalityFields(
    merged.personalityPresets,
    merged.activePersonalityId,
  );
  merged.personalityPresets = p.personalityPresets;
  merged.activePersonalityId = p.activePersonalityId;
  return merged;
}

/** 一键恢复为内置联调默认值（与 defaultAppSettings 一致）。 */
export function integrationTestPreset(): AppSettings {
  return {
    ...defaultAppSettings,
    personalityPresets: defaultAppSettings.personalityPresets.map(p => ({
      ...p,
    })),
  };
}
