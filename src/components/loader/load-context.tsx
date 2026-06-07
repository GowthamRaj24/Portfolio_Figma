"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type LoadContextValue = {
  /** True once the loader has finished and the hero is revealed. */
  revealed: boolean;
  /** Called by the loader when its exit animation completes. */
  setRevealed: (value: boolean) => void;
  /** Background asset load progress, 0..100, reported by the hero video. */
  assetProgress: number;
  /** Report background asset progress (0..100). */
  setAssetProgress: (value: number) => void;
  /** True once the background video can play through without buffering. */
  assetReady: boolean;
  /** Mark the background asset as ready. */
  setAssetReady: (value: boolean) => void;
};

const LoadContext = createContext<LoadContextValue | null>(null);

export function LoadProvider({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealedState] = useState(false);
  const [assetProgress, setAssetProgressState] = useState(0);
  const [assetReady, setAssetReadyState] = useState(false);

  const setRevealed = useCallback((value: boolean) => {
    setRevealedState(value);
    if (typeof document !== "undefined") {
      document.body.classList.toggle("is-loading", !value);
    }
  }, []);

  const setAssetProgress = useCallback((value: number) => {
    setAssetProgressState((prev) => (value > prev ? value : prev));
  }, []);

  const setAssetReady = useCallback((value: boolean) => {
    setAssetReadyState(value);
    if (value) setAssetProgressState(100);
  }, []);

  const value = useMemo(
    () => ({
      revealed,
      setRevealed,
      assetProgress,
      setAssetProgress,
      assetReady,
      setAssetReady,
    }),
    [
      revealed,
      setRevealed,
      assetProgress,
      setAssetProgress,
      assetReady,
      setAssetReady,
    ],
  );

  return <LoadContext.Provider value={value}>{children}</LoadContext.Provider>;
}

export function useReveal() {
  const ctx = useContext(LoadContext);
  if (!ctx) {
    throw new Error("useReveal must be used within a LoadProvider");
  }
  return ctx;
}
