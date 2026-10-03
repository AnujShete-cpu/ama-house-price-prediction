import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";

export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

export function useStoreReady(): boolean {
  const [ready, setReady] = useState(() =>
    typeof window === "undefined" ? false : useAppStore.persist.hasHydrated(),
  );
  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setReady(true));
    if (useAppStore.persist.hasHydrated()) setReady(true);
    return unsub;
  }, []);
  return ready;
}
