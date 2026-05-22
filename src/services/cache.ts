type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

// Global cache object to survive hot reloads in Next.js development mode
const globalCache = global as unknown as {
  __nyanCache?: Map<string, CacheEntry<any>>;
};

if (!globalCache.__nyanCache) {
  globalCache.__nyanCache = new Map<string, CacheEntry<any>>();
}

const cache = globalCache.__nyanCache;

export const CacheService = {
  get<T>(key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return null;
    }

    return entry.value as T;
  },

  set<T>(key: string, value: T, ttlMs: number): void {
    cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  },

  delete(key: string): void {
    cache.delete(key);
  },

  clear(): void {
    cache.clear();
  },

  /**
   * Helper to resolve a promise with cache fallback.
   * If cache hit, returns cached value immediately.
   * Otherwise runs async loader, caches result, and returns it.
   */
  async getOrSet<T>(key: string, loader: () => Promise<T>, ttlMs: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      console.log(`[Cache HIT] Key: ${key}`);
      return cached;
    }

    console.log(`[Cache MISS] Key: ${key}. Fetching fresh...`);
    const freshData = await loader();
    this.set(key, freshData, ttlMs);
    return freshData;
  }
};
