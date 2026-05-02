import {
  DEFAULT_LIVE2D_MODEL3_JSON_URL,
  DEFAULT_LLM_API_BASE_URL,
  DEFAULT_LLM_MODEL,
  DEV_SILICONFLOW_TEST_API_KEY,
} from '../constants/integrationDefaults';

export interface AppSettings {
  apiBaseUrl: string;
  apiKey: string;
  model: string;
  live2dModelUrl: string;
}

export const defaultAppSettings: AppSettings = {
  apiBaseUrl: DEFAULT_LLM_API_BASE_URL,
  apiKey: DEV_SILICONFLOW_TEST_API_KEY,
  model: DEFAULT_LLM_MODEL,
  live2dModelUrl: DEFAULT_LIVE2D_MODEL3_JSON_URL,
};

/** 一键恢复为内置联调默认值（与 defaultAppSettings 一致）。 */
export function integrationTestPreset(): AppSettings {
  return { ...defaultAppSettings };
}
