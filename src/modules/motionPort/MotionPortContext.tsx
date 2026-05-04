import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
} from 'react';
import type { AvatarMotionCommand, MotionCapability } from './types';

/**
 * Live2D 执行面抽象：与「谁根据聊天触发动作」解耦。
 * - Live2DPanel：publishCapabilities + registerExecutor
 * - 插件：dispatchMotion / getCapabilities
 */
export type MotionPortApi = {
  publishCapabilities: (caps: MotionCapability[] | null) => void;
  registerExecutor: (fn: ((cmd: AvatarMotionCommand) => void) | null) => void;
  dispatchMotion: (cmd: AvatarMotionCommand) => void;
  getCapabilities: () => MotionCapability[] | null;
};

const MotionPortContext = createContext<MotionPortApi | null>(null);

export function MotionPortProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const capsRef = useRef<MotionCapability[] | null>(null);
  const execRef = useRef<((cmd: AvatarMotionCommand) => void) | null>(null);

  const api = useMemo<MotionPortApi>(
    () => ({
      publishCapabilities(caps) {
        capsRef.current = caps;
      },
      registerExecutor(fn) {
        execRef.current = fn;
      },
      dispatchMotion(cmd) {
        execRef.current?.(cmd);
      },
      getCapabilities() {
        return capsRef.current;
      },
    }),
    [],
  );

  return (
    <MotionPortContext.Provider value={api}>{children}</MotionPortContext.Provider>
  );
}

export function useMotionPort(): MotionPortApi {
  const ctx = useContext(MotionPortContext);
  if (!ctx) {
    throw new Error('useMotionPort must be used within MotionPortProvider');
  }
  return ctx;
}
