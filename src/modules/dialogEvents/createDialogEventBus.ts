import type { DialogEvent } from './types';

export type DialogEventBus = {
  subscribe: (fn: (e: DialogEvent) => void) => () => void;
  emit: (e: DialogEvent) => void;
};

export function createDialogEventBus(): DialogEventBus {
  const subs = new Set<(e: DialogEvent) => void>();
  return {
    subscribe(fn) {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },
    emit(e) {
      subs.forEach(fn => {
        fn(e);
      });
    },
  };
}
