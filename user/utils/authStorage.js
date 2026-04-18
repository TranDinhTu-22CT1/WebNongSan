const AUTH_KEYS = ['token', 'user', 'isLoggedIn', 'userRole', 'rememberMe'];
const ACTIVE_TABS_KEY = 'authActiveTabs';
const TAB_ID_KEY = 'authTabId';
const TAB_TTL_MS = 45000;
const HEARTBEAT_INTERVAL_MS = 15000;
const SERVER_MONITOR_INTERVAL_MS = 3000;
const SERVER_STATUS_PATH = '/nongsan-api/check_status.php';
const SERVER_DOWN_LOGOUT_AFTER_MS = 15000;

let authHeartbeatTimer = null;
let tabLifecycleHandlersBound = false;
let authServerMonitorTimer = null;
let authServerWasUnavailable = false;
let authServerUnavailableSince = 0;

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

const getNow = () => Date.now();

const parseTabsMap = () => {
  const raw = localStorage.getItem(ACTIVE_TABS_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const saveTabsMap = (tabs) => {
  const keys = Object.keys(tabs || {});
  if (keys.length === 0) {
    localStorage.removeItem(ACTIVE_TABS_KEY);
    return;
  }
  localStorage.setItem(ACTIVE_TABS_KEY, JSON.stringify(tabs));
};

const cleanupStaleTabs = (tabs) => {
  const now = getNow();
  return Object.entries(tabs || {}).reduce((acc, [id, timestamp]) => {
    if (Number.isFinite(timestamp) && now - timestamp <= TAB_TTL_MS) {
      acc[id] = timestamp;
    }
    return acc;
  }, {});
};

const getOrCreateCurrentTabId = () => {
  const existing = sessionStorage.getItem(TAB_ID_KEY);
  if (existing) return existing;

  const generated = `${getNow()}-${Math.random().toString(36).slice(2, 10)}`;
  sessionStorage.setItem(TAB_ID_KEY, generated);
  return generated;
};

const touchCurrentTab = () => {
  const tabId = getOrCreateCurrentTabId();
  const freshTabs = cleanupStaleTabs(parseTabsMap());
  freshTabs[tabId] = getNow();
  saveTabsMap(freshTabs);
};

const removeCurrentTab = () => {
  const tabId = sessionStorage.getItem(TAB_ID_KEY);
  if (!tabId) return;

  const freshTabs = cleanupStaleTabs(parseTabsMap());
  delete freshTabs[tabId];
  saveTabsMap(freshTabs);
};

const stopAuthHeartbeat = () => {
  if (authHeartbeatTimer) {
    window.clearInterval(authHeartbeatTimer);
    authHeartbeatTimer = null;
  }
};

const stopServerMonitor = () => {
  if (authServerMonitorTimer) {
    window.clearInterval(authServerMonitorTimer);
    authServerMonitorTimer = null;
  }
  authServerWasUnavailable = false;
  authServerUnavailableSince = 0;
};

const shouldTrackNonRememberedCustomer = () => {
  const role = String(getStoredUserRole() || '').toLowerCase();
  return localStorage.getItem('rememberMe') === 'false' && (role === 'customer' || role === 'user');
};

export const initAuthSessionLifecycle = () => {
  stopAuthHeartbeat();

  if (!shouldTrackNonRememberedCustomer()) return;

  touchCurrentTab();
  authHeartbeatTimer = window.setInterval(() => {
    if (!shouldTrackNonRememberedCustomer()) {
      stopAuthHeartbeat();
      return;
    }
    touchCurrentTab();
  }, HEARTBEAT_INTERVAL_MS);

  if (!tabLifecycleHandlersBound) {
    window.addEventListener('beforeunload', removeCurrentTab);
    window.addEventListener('pagehide', removeCurrentTab);
    tabLifecycleHandlersBound = true;
  }
};

export const initAuthServerLivenessMonitor = () => {
  stopServerMonitor();

  if (!shouldTrackNonRememberedCustomer()) return;

  const checkServer = async () => {
    const markUnavailableAndMaybeLogout = () => {
      authServerWasUnavailable = true;
      if (!authServerUnavailableSince) {
        authServerUnavailableSince = Date.now();
        return;
      }

      if (Date.now() - authServerUnavailableSince >= SERVER_DOWN_LOGOUT_AFTER_MS && shouldTrackNonRememberedCustomer()) {
        clearAuthSession();
        window.dispatchEvent(new Event('logout'));
      }
    };

    try {
      const response = await fetch(SERVER_STATUS_PATH, {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        markUnavailableAndMaybeLogout();
        return;
      }

      const payload = await response.json().catch(() => null);
      const healthy = payload && payload.status === 'success';

      if (!healthy) {
        markUnavailableAndMaybeLogout();
        return;
      }

      // If the server was previously down and now recovered, end non-remembered login.
      if (authServerWasUnavailable && shouldTrackNonRememberedCustomer()) {
        clearAuthSession();
        window.dispatchEvent(new Event('logout'));
        return;
      }

      authServerWasUnavailable = false;
      authServerUnavailableSince = 0;
    } catch {
      markUnavailableAndMaybeLogout();
    }
  };

  checkServer();
  authServerMonitorTimer = window.setInterval(checkServer, SERVER_MONITOR_INTERVAL_MS);
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
  localStorage.removeItem(ACTIVE_TABS_KEY);
  sessionStorage.removeItem(TAB_ID_KEY);
  stopAuthHeartbeat();
  stopServerMonitor();
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
    touchCurrentTab();
  }

  initAuthSessionLifecycle();
  initAuthServerLivenessMonitor();
};

export const clearExpiredNonRememberedAuth = () => {
  const rememberFlag = localStorage.getItem('rememberMe');
  const activeTabs = cleanupStaleTabs(parseTabsMap());
  saveTabsMap(activeTabs);
  const hasActiveTabs = Object.keys(activeTabs).length > 0;
  const hasCurrentTabContext = Boolean(sessionStorage.getItem(TAB_ID_KEY));
  let role = '';

  try {
    role = String(JSON.parse(localStorage.getItem('user') || '{}')?.role || '').toLowerCase();
  } catch {
    role = '';
  }

  // Only enforce auto-expiry for customer session logins created by remember-me flow.
  // Treat browser refresh as the same tab session when sessionStorage still has tab identity.
  if (rememberFlag === 'false' && !hasActiveTabs && !hasCurrentTabContext && role === 'customer') {
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
