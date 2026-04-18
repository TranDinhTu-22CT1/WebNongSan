const API_PREFIX = '/nongsan-api';
const HEALTH_PATH = '/nongsan-api/check_status.php';
const CACHE_KEY = 'api_origin_cache';

const normalizeOrigin = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value.replace(/\/+$/, '');
};

const parseFallbackPorts = () => {
  const defaults = ['8080', '8000', '8888'];
  const raw = import.meta.env.VITE_API_FALLBACK_PORTS || '';

  if (!raw || typeof raw !== 'string') return defaults;

  const parsed = raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => /^\d{2,5}$/.test(item));

  return parsed.length ? [...new Set(parsed)] : defaults;
};

const buildCandidateOrigins = () => {
  const envOrigin = normalizeOrigin(import.meta.env.VITE_API_ORIGIN || '');
  const envProxyTarget = normalizeOrigin(import.meta.env.VITE_API_PROXY_TARGET || '');
  const envApiBase = normalizeOrigin(import.meta.env.VITE_API_BASE_URL || '');
  const cachedOrigin = normalizeOrigin(localStorage.getItem(CACHE_KEY) || '');

  const host = window.location.hostname || 'localhost';
  const currentOrigin = normalizeOrigin(window.location.origin || '');
  const proto = window.location.protocol === 'https:' ? 'https:' : 'http:';
  const fallbackPorts = parseFallbackPorts();
  const isApiBaseAbsolute = /^https?:\/\//i.test(envApiBase);
  const apiBaseOrigin = isApiBaseAbsolute
    ? normalizeOrigin(new URL(envApiBase).origin)
    : '';

  const hostCandidates = fallbackPorts.flatMap((port) => [
    `http://${host}:${port}`,
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
  ]);

  const candidates = [
    envOrigin,
    envProxyTarget,
    apiBaseOrigin,
    cachedOrigin,
    currentOrigin,
    `${proto}//${host}`,
    `http://${host}`,
    `https://${host}:4433`,
    'http://localhost',
    'https://localhost:4433',
    'http://127.0.0.1',
    'https://127.0.0.1:4433',
    ...hostCandidates,
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

  return (nativeFetch) => {
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
  if (typeof input === 'string') return input.startsWith(API_PREFIX);
  if (input instanceof URL) return input.pathname.startsWith(API_PREFIX);
  if (typeof Request !== 'undefined' && input instanceof Request) {
    const parsed = new URL(input.url, window.location.origin);
    return parsed.pathname.startsWith(API_PREFIX);
  }
  return false;
};

const rewriteUrl = (input, origin) => {
  if (!origin) return input;

  if (typeof input === 'string') {
    return `${origin}${input}`;
  }

  if (input instanceof URL) {
    return new URL(`${origin}${input.pathname}${input.search}`);
  }

  if (typeof Request !== 'undefined' && input instanceof Request) {
    const parsed = new URL(input.url, window.location.origin);
    const rewritten = `${origin}${parsed.pathname}${parsed.search}`;
    return new Request(rewritten, input);
  }

  return input;
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
    return nativeFetch(rewritten, init);
  };

  window.__apiFetchAdapterInstalled = true;
};
