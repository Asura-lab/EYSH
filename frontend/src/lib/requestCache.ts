import type { AxiosResponse } from "axios";

const CACHE_PREFIX = "eysh_cache:";
const DEFAULT_TTL_MS = 5 * 60 * 1000;
let clearedOnReload = false;

type CacheEntry<T> = {
  t: number;
  data: T;
  status?: number;
};

const isBrowser = () => typeof window !== "undefined";

const isReloadNavigation = (): boolean => {
  if (!isBrowser() || typeof performance === "undefined") return false;
  const entries = performance.getEntriesByType?.("navigation") as PerformanceNavigationTiming[] | undefined;
  if (entries && entries.length > 0) {
    return entries[0].type === "reload";
  }
  const nav = (performance as any).navigation;
  return nav && nav.type === 1;
};

const clearCacheOnReload = () => {
  if (!isBrowser() || clearedOnReload) return;
  if (!isReloadNavigation()) return;
  clearedOnReload = true;
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keys.push(key);
      }
    }
    keys.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // ignore cache clear errors
  }
};

const stableStringify = (value: any): string => {
  if (value === null || value === undefined) return "";
  if (typeof value !== "object") return String(value);
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${k}:${stableStringify(value[k])}`).join(",")}}`;
};

const buildCacheKey = (url: string, method: string, params?: any, auth?: string | null) => {
  const paramsKey = params ? stableStringify(params) : "";
  const authKey = auth ? stableStringify(auth) : "";
  return `${CACHE_PREFIX}${method}:${url}?${paramsKey}|${authKey}`;
};

const readCache = <T,>(key: string, ttlMs: number): CacheEntry<T> | null => {
  if (!isBrowser()) return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (!entry?.t) return null;
    if (Date.now() - entry.t > ttlMs) {
      sessionStorage.removeItem(key);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
};

const writeCache = <T,>(key: string, data: T, status?: number) => {
  if (!isBrowser()) return;
  try {
    const entry: CacheEntry<T> = { t: Date.now(), data, status };
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // ignore cache write errors
  }
};

export const cachedFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: { ttlMs?: number; force?: boolean } = {}
): Promise<Response> => {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const method = (init.method || "GET").toUpperCase();

  if (!isBrowser() || method !== "GET") {
    return fetch(input, init);
  }

  clearCacheOnReload();

  const headers = (init.headers || {}) as Record<string, string>;
  const auth = headers.Authorization || headers.authorization || null;
  const url = typeof input === "string" ? input : input.toString();
  const key = buildCacheKey(url, method, undefined, auth);

  if (!options.force) {
    const cached = readCache<any>(key, ttlMs);
    if (cached) {
      return new Response(JSON.stringify(cached.data), {
        status: cached.status ?? 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const res = await fetch(input, init);
  if (res.ok) {
    try {
      const cloned = res.clone();
      const data = await cloned.json();
      writeCache(key, data, res.status);
    } catch {
      // non-JSON responses are not cached
    }
  }
  return res;
};

export const cachedAxiosGet = async <T,>(
  client: { get: (url: string, config?: any) => Promise<AxiosResponse<T>> },
  url: string,
  config?: { params?: any; headers?: Record<string, string> },
  options: { ttlMs?: number; force?: boolean } = {}
): Promise<AxiosResponse<T>> => {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  if (!isBrowser()) {
    return client.get(url, config);
  }

  clearCacheOnReload();

  const auth = config?.headers?.Authorization || config?.headers?.authorization || null;
  const key = buildCacheKey(url, "GET", config?.params, auth);

  if (!options.force) {
    const cached = readCache<T>(key, ttlMs);
    if (cached) {
      return {
        data: cached.data,
        status: cached.status ?? 200,
        statusText: "OK",
        headers: {},
        config,
      } as AxiosResponse<T>;
    }
  }

  const res = await client.get(url, config);
  if (res?.status >= 200 && res?.status < 300) {
    writeCache(key, res.data, res.status);
  }
  return res;
};

export const CACHE_TTL_MS = DEFAULT_TTL_MS;
