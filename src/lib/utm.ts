export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  capturedAt?: string;
  landingPath?: string;
};

const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
const STORAGE_KEY = "hpp-utm";

export function captureUtmFromLocation(): UtmParams | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const next: UtmParams = {};
  for (const key of KEYS) {
    const value = params.get(key);
    if (value) next[key] = value.slice(0, 120);
  }
  if (Object.keys(next).length === 0) {
    return readUtm();
  }
  next.capturedAt = new Date().toISOString();
  next.landingPath = `${window.location.pathname}${window.location.search}`;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  return next;
}

export function readUtm(): UtmParams | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UtmParams;
  } catch {
    return null;
  }
}

export function formatUtm(utm: UtmParams | null): string | null {
  if (!utm) return null;
  const parts = [utm.utm_source, utm.utm_medium, utm.utm_campaign].filter(Boolean);
  return parts.length ? parts.join(" / ") : null;
}
