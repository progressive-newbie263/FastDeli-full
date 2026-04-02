import { API_CONFIG } from '../config/api';
import { getAuthToken } from '../lib/storage';

const HTTP_TIMEOUT_MS = 15000;

async function buildAuthHeaders() {
  const token = await getAuthToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function httpPost<T>(url: string, body: unknown): Promise<T> {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
  try {
    console.log('[HTTP][POST] start', { url, body });
    const authHeaders = await buildAuthHeaders();
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(body ?? {}),
      signal: controller.signal,
    });

    const data = await resp.json().catch(() => null);
    console.log('[HTTP][POST] response', {
      url,
      status: resp.status,
      ok: resp.ok,
      durationMs: Date.now() - start,
      data,
    });
    if (!resp.ok) {
      throw new Error(data?.message || `HTTP ${resp.status}`);
    }
    return data;
  } catch (err: any) {
    console.log('[HTTP][POST] error', {
      url,
      durationMs: Date.now() - start,
      message: err?.message,
      name: err?.name,
    });
    if (err?.name === 'AbortError') {
      throw new Error(`Request timeout after ${HTTP_TIMEOUT_MS}ms: ${url}`);
    }
    if (err?.message) {
      throw err;
    }
    throw new Error(`Cannot connect to API: ${url}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function httpGet<T>(url: string): Promise<T> {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
  try {
    console.log('[HTTP][GET] start', { url });
    const authHeaders = await buildAuthHeaders();
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        ...authHeaders,
      },
      signal: controller.signal,
    });

    const data = await resp.json().catch(() => null);
    console.log('[HTTP][GET] response', {
      url,
      status: resp.status,
      ok: resp.ok,
      durationMs: Date.now() - start,
      data,
    });
    if (!resp.ok) {
      throw new Error(data?.message || `HTTP ${resp.status}`);
    }
    return data;
  } catch (err: any) {
    console.log('[HTTP][GET] error', {
      url,
      durationMs: Date.now() - start,
      message: err?.message,
      name: err?.name,
    });
    if (err?.name === 'AbortError') {
      throw new Error(`Request timeout after ${HTTP_TIMEOUT_MS}ms: ${url}`);
    }
    if (err?.message) {
      throw err;
    }
    throw new Error(`Cannot connect to API: ${url}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

export const authUrl = {
  login: `${API_CONFIG.authBaseUrl}/api/auth/login`,
};

export const driverUrl = {
  register: `${API_CONFIG.driverBaseUrl}/api/driver/register`,
  location: `${API_CONFIG.driverBaseUrl}/api/driver/location`,
  deliveringOrders: `${API_CONFIG.driverBaseUrl}/api/driver/orders/delivering`,
  orderMap: (orderId: number) => `${API_CONFIG.driverBaseUrl}/api/driver/orders/${orderId}/map`,
  confirmDelivered: (orderId: number) =>
    `${API_CONFIG.driverBaseUrl}/api/driver/orders/${orderId}/confirm-delivered`,
};

