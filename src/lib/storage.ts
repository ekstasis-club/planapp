export const isClient = typeof window !== "undefined";

export function readJSON<T>(key: string, fallback: T): T {
  if (!isClient) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T) {
  if (!isClient) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function pushJSON<T>(key: string, item: T) {
  const arr = readJSON<T[]>(key, []);
  arr.unshift(item);
  writeJSON(key, arr);
}

export function uid() {
  return crypto.randomUUID().replace(/-/g, "");
}
