const protectedCache = new Map<string, unknown>();

export function writeProtectedCacheValue(key: string, value: unknown) {
  protectedCache.set(key, value);
}

export function readProtectedCacheValue(key: string): unknown {
  return protectedCache.get(key);
}

export function clearProtectedCache() {
  protectedCache.clear();
}

export function getProtectedCacheSize(): number {
  return protectedCache.size;
}
