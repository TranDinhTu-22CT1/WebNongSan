const AUTH_KEYS = ['token', 'user', 'isLoggedIn', 'userRole', 'rememberMe'];
const SESSION_MARKER_KEY = 'authSessionActive';

const readFirst = (key) => localStorage.getItem(key) || sessionStorage.getItem(key) || null;
const normalizeRole = (value) => String(value || '').trim().toLowerCase();

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  const payload = decodeJwtPayload(token);
  const exp = Number(payload?.exp || 0);
  if (!exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return exp <= now;
};

export const getAuthToken = () => readFirst('token');

export const getStoredUser = () => {
  const raw = readFirst('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getStoredUserRole = () => {
  const roleFromStorage = readFirst('userRole') || getStoredUser()?.role || '';
  const normalizedFromStorage = normalizeRole(roleFromStorage);
  if (normalizedFromStorage) return normalizedFromStorage;

  const payload = decodeJwtPayload(getAuthToken());
  return normalizeRole(payload?.role);
};

export const isRememberedLogin = () => localStorage.getItem('rememberMe') === 'true';

export const clearAuthSession = () => {
  AUTH_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  sessionStorage.removeItem(SESSION_MARKER_KEY);
};

export const setAuthSession = ({ token, user, rememberMe }) => {
  clearAuthSession();

  const role = normalizeRole(user?.role || 'customer');

  // Keep auth data in localStorage for legacy admin/vendor screens that still read localStorage directly.
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify({ ...user, role }));
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('userRole', role);
  localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');

  // Mirror to sessionStorage so user pages that read session-based auth also work consistently.
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', JSON.stringify({ ...user, role }));
  sessionStorage.setItem('isLoggedIn', 'true');
  sessionStorage.setItem('userRole', role);
  sessionStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');

  if (!rememberMe) {
    sessionStorage.setItem(SESSION_MARKER_KEY, 'true');
  }
};

export const clearExpiredNonRememberedAuth = () => {
  const rememberFlag = localStorage.getItem('rememberMe');
  const activeSession = sessionStorage.getItem(SESSION_MARKER_KEY) === 'true';
  let role = '';

  try {
    role = String(JSON.parse(localStorage.getItem('user') || '{}')?.role || '').toLowerCase();
  } catch {
    role = '';
  }

  // Only enforce auto-expiry for customer session logins created by remember-me flow.
  if (rememberFlag === 'false' && !activeSession && role === 'customer') {
    clearAuthSession();
  }
};

export const hasValidAuthSession = ({ allowRoles = null } = {}) => {
  const token = getAuthToken();
  const user = getStoredUser();
  const loggedInFlag = readFirst('isLoggedIn');

  if (!token || !user || !user.id || loggedInFlag !== 'true') return false;
  if (isTokenExpired(token)) {
    clearAuthSession();
    return false;
  }

  if (Array.isArray(allowRoles) && allowRoles.length > 0) {
    const role = getStoredUserRole();
    return allowRoles.map(normalizeRole).includes(normalizeRole(role));
  }

  return true;
};
