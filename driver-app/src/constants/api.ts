import { Platform } from 'react-native';

const AUTH_PORT = '5000';
const DRIVER_PORT = '5002';

// Default true de van dev local nhanh. Dat EXPO_PUBLIC_ENABLE_LOCAL_FALLBACK=false
// khi test tren mang cong ty voi tunnel public de tranh app thu localhost.
const ENABLE_LOCAL_FALLBACK = (() => {
  const raw = process.env.EXPO_PUBLIC_ENABLE_LOCAL_FALLBACK?.trim().toLowerCase();
  if (!raw) {
    return true;
  }

  return !['0', 'false', 'off', 'no'].includes(raw);
})();

const trimTrailingSlash = (url: string) => url.replace(/\/$/, '');

const normalizeUrl = (url: string) => trimTrailingSlash(url.trim());

const pushIfUnique = (list: string[], value: string | null | undefined) => {
  if (!value) {
    return;
  }

  const normalized = normalizeUrl(value);
  if (!normalized) {
    return;
  }

  if (!list.includes(normalized)) {
    list.push(normalized);
  }
};

const getFallbackHosts = () => {
  const hosts: string[] = [];

  if (Platform.OS === 'android') {
    pushIfUnique(hosts, 'http://10.0.2.2');
  }

  pushIfUnique(hosts, 'http://localhost');
  return hosts;
};

const withPort = (host: string, port: string) => `${trimTrailingSlash(host)}:${port}`;

const toEnvUrl = (raw: string | undefined) => {
  if (!raw) {
    return null;
  }
  const normalized = normalizeUrl(raw);
  if (normalized.length === 0) {
    return null;
  }

  if (!/^https?:\/\//.test(normalized)) {
    return null;
  }

  return normalized;
};

const AUTH_API_FROM_ENV = process.env.EXPO_PUBLIC_AUTH_API_URL;
const DELIVERY_API_FROM_ENV = process.env.EXPO_PUBLIC_DELIVERY_API_URL;

const deriveDeliveryFromAuth = (authUrl: string) => {
  if (!authUrl) {
    return null;
  }

  if (authUrl.includes(':5000')) {
    return authUrl.replace(':5000', ':5002');
  }

  if (authUrl.includes('-5000.')) {
    return authUrl.replace('-5000.', '-5002.');
  }

  return null;
};

const buildAuthCandidates = () => {
  const candidates: string[] = [];

  const envAuth = toEnvUrl(AUTH_API_FROM_ENV);
  pushIfUnique(candidates, envAuth);
  if (candidates.length > 0) {
    return candidates;
  }

  if (!ENABLE_LOCAL_FALLBACK) {
    return candidates;
  }

  getFallbackHosts().forEach((host) => pushIfUnique(candidates, withPort(host, AUTH_PORT)));

  return candidates;
};

const buildDriverCandidates = (authCandidates: string[]) => {
  const candidates: string[] = [];

  const envDelivery = toEnvUrl(DELIVERY_API_FROM_ENV);
  pushIfUnique(candidates, envDelivery);
  if (candidates.length > 0) {
    return candidates;
  }

  authCandidates.forEach((authUrl) => {
    const derived = deriveDeliveryFromAuth(authUrl);
    if (derived) {
      pushIfUnique(candidates, derived);
      return;
    }

    if (authUrl.includes(':5000')) {
      pushIfUnique(candidates, authUrl.replace(':5000', ':5002'));
      return;
    }

    pushIfUnique(candidates, withPort(authUrl, DRIVER_PORT));
  });
  if (candidates.length > 0) {
    return candidates;
  }

  if (!ENABLE_LOCAL_FALLBACK) {
    return candidates;
  }

  getFallbackHosts().forEach((host) => pushIfUnique(candidates, withPort(host, DRIVER_PORT)));

  return candidates;
};

export const AUTH_API_CANDIDATES = buildAuthCandidates();
export const DRIVER_API_CANDIDATES = buildDriverCandidates(AUTH_API_CANDIDATES);

export const AUTH_API_URL = AUTH_API_CANDIDATES[0] || 'http://localhost:5000';

export const DRIVER_API_URL = DRIVER_API_CANDIDATES[0] || 'http://localhost:5002';

if (__DEV__) {
  console.log('[API] EXPO_PUBLIC_ENABLE_LOCAL_FALLBACK =', ENABLE_LOCAL_FALLBACK);
  console.log('[API] AUTH_API_URL =', AUTH_API_URL);
  console.log('[API] AUTH_API_CANDIDATES =', AUTH_API_CANDIDATES);
  console.log('[API] DRIVER_API_URL =', DRIVER_API_URL);
  console.log('[API] DRIVER_API_CANDIDATES =', DRIVER_API_CANDIDATES);
}
