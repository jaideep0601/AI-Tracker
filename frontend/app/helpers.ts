import { SOURCE_COLORS } from "./constants";

export function getSourceColor(type: string): string {
  return SOURCE_COLORS[type] || SOURCE_COLORS.default;
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)    return "just now";
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

export function saveLocal(email: string, key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(`ts_${email}_${key}`, JSON.stringify(value)); } catch {}
}

export function loadLocal<T>(email: string, key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const r = localStorage.getItem(`ts_${email}_${key}`);
    return r ? (JSON.parse(r) as T) : fallback;
  } catch { return fallback; }
}

export function loadGlobal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const r = localStorage.getItem(key);
    return r ? (JSON.parse(r) as T) : fallback;
  } catch { return fallback; }
}

export function saveGlobal(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
