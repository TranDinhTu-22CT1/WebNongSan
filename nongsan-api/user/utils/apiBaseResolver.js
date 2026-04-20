const API_PREFIX = '/nongsan-api';
const HEALTH_PATH = '/nongsan-api/check_status.php';
const CACHE_KEY = 'api_origin_cache';

const normalizeOrigin = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value.replace(/\/+$/, '');
};

const hasExplicitPort = (origin) => {
  if (!origin || typeof origin !== 'string') return false;
  try {
    return new URL(origin).port !== '';
  } catch {
    return false;
  }
};

const isLocalLikeHostname = (hostname) => {
  const host = String(hostname || '').toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
};

const isApiPathname = (pathname) => {
  if (!pathname || typeof pathname !== 'string') return false;
  return pathname === API_PREFIX || pathname.startsWith(`${API_PREFIX}/`);
};

const buildCandidateOrigins = () => {
  const envOrigin = normalizeOrigin(import.meta.env.VITE_API_ORIGIN || '');
  const envProxyTarget = normalizeOrigin(import.meta.env.VITE_API_PROXY_TARGET || '');
  const envApiBase = normalizeOrigin(import.meta.env.VITE_API_BASE_URL || '');
  const cachedOrigin = normalizeOrigin(localStorage.getItem(CACHE_KEY) || '');

  const host = window.location.hostname || 'localhost';
  const currentOrigin = normalizeOrigin(window.location.origin || '');
  const proto = window.location.protocol === 'https:' ? 'https:' : 'http:';
  const isApiBaseAbsolute = /^https?:\/\//i.test(envApiBase);
  const apiBaseOrigin = isApiBaseAbsolute
    ? normalizeOrigin(new URL(envApiBase).origin)
    : '';

  const pinnedEnvCandidates = [envOrigin, envProxyTarget, apiBaseOrigin].filter(
    (origin) => hasExplicitPort(origin),
  );

  const nonPinnedEnvCandidates = [envOrigin, envProxyTarget, apiBaseOrigin].filter(
    (origin) => origin && !hasExplicitPort(origin),
  );

  const candidates = [
    ...pinnedEnvCandidates,
    cachedOrigin,
    ...nonPinnedEnvCandidates,
    `${proto}//${host}`,
    `http://${host}`,
    'http://localhost',
    'http://127.0.0.1',
    // Keep currentOrigin late in the list to avoid false positives through Vite proxy.
    currentOrigin,
  ].filter(Boolean);

  return [...new Set(candidates)];
};

const probeOrigin = async (origin, nativeFetch) => {
  const url = `${origin}${HEALTH_PATH}`;

  try {
    const res = await nativeFetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
    });

    if (!res.ok) return false;

    const text = await res.text();
    if (!text) return false;

    try {
      const json = JSON.parse(text);
      return json && json.status === 'success';
    } catch {
      return false;
    }
  } catch {
    return false;
  }
};

const resolveApiOrigin = (() => {
  let resolvingPromise = null;

  return (nativeFetch, { forceRefresh = false } = {}) => {
    if (forceRefresh) {
      localStorage.removeItem(CACHE_KEY);
      resolvingPromise = null;
    }

    if (resolvingPromise) return resolvingPromise;

    resolvingPromise = (async () => {
      const origins = buildCandidateOrigins();

      for (const origin of origins) {
        // eslint-disable-next-line no-await-in-loop
        const ok = await probeOrigin(origin, nativeFetch);
        if (ok) {
          localStorage.setItem(CACHE_KEY, origin);
          return origin;
        }
      }

      return '';
    })();

    return resolvingPromise;
  };
})();

const shouldRewriteUrl = (input) => {
  if (typeof input === 'string') {
    if (input.startsWith(API_PREFIX)) return true;

    try {
      const parsed = new URL(input, window.location.origin);
      return isApiPathname(parsed.pathname) && isLocalLikeHostname(parsed.hostname);
    } catch {
      return false;
    }
  }

  if (input instanceof URL) {
    return isApiPathname(input.pathname) && isLocalLikeHostname(input.hostname);
  }

  if (typeof Request !== 'undefined' && input instanceof Request) {
    const parsed = new URL(input.url, window.location.origin);
    return isApiPathname(parsed.pathname) && isLocalLikeHostname(parsed.hostname);
  }

  return false;
};

const rewriteUrl = (input, origin) => {
  if (!origin) return input;

  if (typeof input === 'string') {
    if (input.startsWith(API_PREFIX)) return `${origin}${input}`;

    try {
      const parsed = new URL(input, window.location.origin);
      if (isApiPathname(parsed.pathname)) {
        return `${origin}${parsed.pathname}${parsed.search}`;
      }
      return input;
    } catch {
      return input;
    }
  }

  if (input instanceof URL) {
    if (!isApiPathname(input.pathname)) return input;
    return new URL(`${origin}${input.pathname}${input.search}`);
  }

  if (typeof Request !== 'undefined' && input instanceof Request) {
    const parsed = new URL(input.url, window.location.origin);
    const rewritten = `${origin}${parsed.pathname}${parsed.search}`;
    return new Request(rewritten, input);
  }

  return input;
};

const shouldRetryWithRefreshedOrigin = (response) => {
  if (!response) return false;
  return [404, 502, 503, 504].includes(response.status);
};

export const installApiFetchAdapter = () => {
  if (typeof window === 'undefined' || typeof window.fetch !== 'function') return;
  if (window.__apiFetchAdapterInstalled) return;

  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    if (!shouldRewriteUrl(input)) {
      return nativeFetch(input, init);
    }

    const origin = await resolveApiOrigin(nativeFetch);
    const rewritten = rewriteUrl(input, origin);

    try {
      const response = await nativeFetch(rewritten, init);
      if (!response.ok && shouldRetryWithRefreshedOrigin(response)) {
        const refreshedOrigin = await resolveApiOrigin(nativeFetch, { forceRefresh: true });
        const refreshedUrl = rewriteUrl(input, refreshedOrigin);
        return nativeFetch(refreshedUrl, init);
      }
      return response;
    } catch {
      // If chosen origin becomes unreachable, clear cache and re-probe once.
      const refreshedOrigin = await resolveApiOrigin(nativeFetch, { forceRefresh: true });
      const refreshedUrl = rewriteUrl(input, refreshedOrigin);
      return nativeFetch(refreshedUrl, init);
    }
  };

  window.__apiFetchAdapterInstalled = true;
};
