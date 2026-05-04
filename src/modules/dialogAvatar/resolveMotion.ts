import type { AvatarMotionCommand, MotionCapability } from '../motionPort';
import { ASSISTANT_TEXT_INTENT_RULES, type IntentRule } from './intentRules';

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function findCapability(
  caps: MotionCapability[],
  groupName: string,
): MotionCapability | undefined {
  const n = norm(groupName);
  return caps.find(c => norm(c.group) === n);
}

/** 默认：优先 Idle 组，否则按组名字母序取第一个非空组 */
export function pickDefaultMotion(caps: MotionCapability[]): AvatarMotionCommand {
  if (caps.length === 0) {
    return { kind: 'motion', group: 'Idle', index: 0 };
  }
  const idle = caps.find(c => /^idle$/i.test(c.group.trim()));
  const chosen = idle ?? [...caps].sort((a, b) => a.group.localeCompare(b.group))[0];
  return { kind: 'motion', group: chosen.group, index: 0 };
}

/**
 * 根据助手全文 + 模型支持的动作列表，解析要播放的一条动作。
 * 无规则命中时播放默认动作（见 pickDefaultMotion）。
 */
export function resolveAssistantTextToMotion(
  text: string,
  capabilities: MotionCapability[],
  rules: IntentRule[] = ASSISTANT_TEXT_INTENT_RULES,
): AvatarMotionCommand {
  if (capabilities.length === 0) {
    return { kind: 'motion', group: 'Idle', index: 0 };
  }

  for (const rule of rules) {
    if (!rule.match.test(text)) {
      continue;
    }
    for (const g of rule.preferredMotionGroups) {
      const cap = findCapability(capabilities, g);
      if (cap && cap.count > 0) {
        const index =
          cap.count > 1 ? Math.floor(Math.random() * cap.count) : 0;
        return { kind: 'motion', group: cap.group, index };
      }
    }
  }

  return pickDefaultMotion(capabilities);
}
