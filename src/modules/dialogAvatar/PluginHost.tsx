import React, { useEffect } from 'react';
import { useDialogEventBus } from '../dialogEvents';
import { useMotionPort } from '../motionPort';
import { installDialogAvatarPlugin } from './installDialogAvatarPlugin';

/**
 * 在应用根部挂载一次即可启用「聊天 → Live2D 动作」插件。
 * 去掉该组件即关闭该能力，无需改 Chat / Live2DPanel / LLM 代码。
 */
export function DialogAvatarPluginHost() {
  const bus = useDialogEventBus();
  const motion = useMotionPort();

  useEffect(() => installDialogAvatarPlugin(bus, motion), [bus, motion]);

  return null;
}
