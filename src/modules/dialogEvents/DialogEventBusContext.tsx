import React, { createContext, useContext, useMemo } from 'react';
import { createDialogEventBus, type DialogEventBus } from './createDialogEventBus';

const DialogEventBusContext = createContext<DialogEventBus | null>(null);

export function DialogEventBusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const bus = useMemo(() => createDialogEventBus(), []);
  return (
    <DialogEventBusContext.Provider value={bus}>
      {children}
    </DialogEventBusContext.Provider>
  );
}

export function useDialogEventBus(): DialogEventBus {
  const ctx = useContext(DialogEventBusContext);
  if (!ctx) {
    throw new Error('useDialogEventBus must be used within DialogEventBusProvider');
  }
  return ctx;
}
