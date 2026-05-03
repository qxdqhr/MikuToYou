import { DEFAULT_PERSONALITY_PRESETS } from './defaults';
import type { PersonalityPreset } from './types';

/**
 * 校验并补全人格列表与当前选中 id（供设置持久化加载使用）。
 */
export function ensurePersonalityFields(
  presets: PersonalityPreset[] | undefined | null,
  activePersonalityId: string | null | undefined,
): {
  personalityPresets: PersonalityPreset[];
  activePersonalityId: string | null;
} {
  const personalityPresets =
    Array.isArray(presets) && presets.length > 0
      ? presets.map(p => ({ ...p }))
      : DEFAULT_PERSONALITY_PRESETS.map(p => ({ ...p }));

  const validIds = new Set(personalityPresets.map(p => p.id));
  let active: string | null = activePersonalityId ?? null;
  if (active != null && !validIds.has(active)) {
    active = personalityPresets[0]?.id ?? null;
  }
  return { personalityPresets, activePersonalityId: active };
}
