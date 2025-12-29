import React, { createContext, useContext, useMemo } from "react";
import { createHeadManager, type HeadManager } from "./headManager";

const HeadManagerContext = createContext<HeadManager | null>(null);

export function HeadProvider({
  manager,
  children,
}: {
  manager?: HeadManager;
  children: React.ReactNode;
}) {
  const value = useMemo(() => manager ?? createHeadManager(), [manager]);
  return <HeadManagerContext.Provider value={value}>{children}</HeadManagerContext.Provider>;
}

export function useHeadManager(): HeadManager {
  const ctx = useContext(HeadManagerContext);
  if (!ctx) {
    // Fallback to avoid hard crash if used outside provider.
    return createHeadManager();
  }
  return ctx;
}


