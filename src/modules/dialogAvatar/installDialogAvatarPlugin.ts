import type { DialogEventBus } from '../dialogEvents';
import type { MotionPortApi } from '../motionPort';
import { ASSISTANT_TEXT_INTENT_RULES } from './intentRules';
import { resolveAssistantTextToMotion } from './resolveMotion';

/**
 * 即插即用：订阅「助手消息完成」事件，按配置表驱动 MotionPort。
 * 不依赖 React；在根组件 mount 时 subscribe，unmount 时 dispose。
 */
export function installDialogAvatarPlugin(
  bus: DialogEventBus,
  motion: MotionPortApi,
): () => void {
  return bus.subscribe(event => {
    if (event.type !== 'chat.assistant.completed') {
      return;
    }
    const caps = motion.getCapabilities();
    if (!caps || caps.length === 0) {
      return;
    }
    const cmd = resolveAssistantTextToMotion(
      event.payload.text,
      caps,
      ASSISTANT_TEXT_INTENT_RULES,
    );
    motion.dispatchMotion(cmd);
  });
}
