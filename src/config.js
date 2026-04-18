// -------------------------------------------------------------------
// API base URL — single source of truth for the entire frontend.
//
// HOW TO CONFIGURE (per machine, never commit your .env):
//   Copy .env.example → .env and set:
//     VITE_API_PROXY_TARGET=http://localhost        ← your XAMPP origin
//
// The default value '/nongsan-api' is a relative path that Vite's
// dev-server proxies to VITE_API_PROXY_TARGET automatically.
// You only need to change VITE_API_BASE_URL if you want to bypass
// the proxy entirely (e.g. point straight to a remote server).
// -------------------------------------------------------------------

const stripTrailingSlash = (value) => (value || '').replace(/\/$/, '');

const isLocalhostBaseWithoutPort = (value) => {
  if (!value || typeof value !== 'string') return false;

  try {
    const parsed = new URL(value, window?.location?.origin || 'http://localhost');
    const host = parsed.hostname;
    const isLocalhost = host === 'localhost' || host === '127.0.0.1';
    return isLocalhost && parsed.port === '';
  } catch {
    return false;
  }
};

const envBase = stripTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_USER_API_BASE_URL || '',
);

// If someone sets http://localhost/nongsan-api without a port, keep it relative
// so requests stay on the current origin/proxy without scanning port numbers.
const normalizedBase = isLocalhostBaseWithoutPort(envBase) ? '/nongsan-api' : envBase;

export const API_BASE = stripTrailingSlash(normalizedBase || '/nongsan-api');
