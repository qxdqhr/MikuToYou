export interface AppSettings {
  apiBaseUrl: string;
  apiKey: string;
  model: string;
  live2dModelUrl: string;
}

export const defaultAppSettings: AppSettings = {
  apiBaseUrl: '',
  apiKey: '',
  model: 'gpt-4o-mini',
  live2dModelUrl: '',
};
