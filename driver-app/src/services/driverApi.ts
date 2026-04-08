import { DRIVER_API_CANDIDATES, DRIVER_API_URL } from '../constants/api';
import { AvailableOrder, DriverOrder, DriverProfile, WalletSummary } from '../types/driver';

const parseTimeoutMs = (raw: string | undefined, fallback = 4500) => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 1500), 20000);
};

const REQUEST_TIMEOUT_MS = parseTimeoutMs(process.env.EXPO_PUBLIC_API_TIMEOUT_MS, 4500);

class ApiResponseError extends Error {}

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
};

const buildHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'bypass-tunnel-reminder': 'true',
  Authorization: `Bearer ${token}`,
});

const parseErrorMessage = (body: unknown, fallback: string) => {
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = (body as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }
  return fallback;
};

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal as any,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout (${timeoutMs}ms)`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

const request = async <T>(
  token: string,
  path: string,
  options?: RequestInit,
  fallbackMessage = 'Không thể gọi API tài xế.'
): Promise<T> => {
  let connectivityError: Error | null = null;

  for (const baseUrl of DRIVER_API_CANDIDATES) {
    try {
      const response = await fetchWithTimeout(`${baseUrl}${path}`, {
        ...options,
        headers: {
          ...buildHeaders(token),
          ...(options?.headers || {}),
        },
      });

      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        // Sai endpoint/tunnel het han thuong khong tra JSON, thu URL tiep theo.
        if (!response.ok) {
          connectivityError = new Error(`Phan hoi khong hop le tu ${baseUrl}`);
          continue;
        }
        throw new ApiResponseError(`Phan hoi tu API tai xe khong phai JSON (${baseUrl}).`);
      }

      if (!response.ok) {
        throw new ApiResponseError(parseErrorMessage(payload, fallbackMessage));
      }

      return payload as T;
    } catch (error) {
      if (error instanceof ApiResponseError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'unknown error';
      connectivityError = new Error(`${baseUrl}: ${message}`);
    }
  }

  throw new Error(
    `${fallbackMessage} URL uu tien: ${DRIVER_API_URL}. Da thu: ${DRIVER_API_CANDIDATES.join(', ')}. Chi tiet: ${
      connectivityError?.message || 'khong xac dinh'
    }`
  );
};

export const getDriverProfile = async (token: string): Promise<DriverProfile> => {
  const payload = await request<ApiEnvelope<DriverProfile>>(token, '/api/driver/me', {
    method: 'GET',
  });

  if (!payload.success || !payload.data) {
    throw new Error(payload.message || 'Không lấy được hồ sơ tài xế.');
  }

  return payload.data;
};

export const syncDriverProfile = async (token: string): Promise<DriverProfile> => {
  const payload = await request<ApiEnvelope<DriverProfile>>(token, '/api/driver/create-profile', {
    method: 'POST',
  });

  if (!payload.success || !payload.data) {
    throw new Error(payload.message || 'Không thể đồng bộ hồ sơ tài xế.');
  }

  return payload.data;
};

export const updateDriverStatus = async (
  token: string,
  status: 'online' | 'offline'
): Promise<DriverProfile> => {
  const payload = await request<ApiEnvelope<DriverProfile>>(
    token,
    '/api/driver/status',
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
    'Không thể cập nhật trạng thái tài xế.'
  );

  if (!payload.success || !payload.data) {
    throw new Error(payload.message || 'Không thể cập nhật trạng thái tài xế.');
  }

  return payload.data;
};

export const updateDriverLocation = async (
  token: string,
  latitude: number,
  longitude: number,
  accuracy?: number | null
): Promise<void> => {
  const payload = await request<ApiEnvelope<null>>(
    token,
    '/api/driver/location',
    {
      method: 'POST',
      body: JSON.stringify({
        lat: latitude,
        lng: longitude,
        accuracy: accuracy ?? null,
      }),
    },
    'Không thể cập nhật vị trí tài xế.'
  );

  if (!payload.success) {
    throw new Error(payload.message || 'Không thể cập nhật vị trí tài xế.');
  }
};

export const getAvailableOrders = async (
  token: string,
  latitude: number,
  longitude: number,
  radiusKm = 30
): Promise<AvailableOrder[]> => {
  const params = new URLSearchParams({
    lat: String(latitude),
    lng: String(longitude),
    radius_km: String(radiusKm),
  });

  const payload = await request<ApiEnvelope<AvailableOrder[]>>(
    token,
    `/api/driver/available-orders?${params.toString()}`,
    { method: 'GET' },
    'Không thể tải danh sách đơn khả dụng.'
  );

  if (!payload.success) {
    throw new Error(payload.message || 'Không thể tải danh sách đơn khả dụng.');
  }

  return payload.data || [];
};

export const acceptOrder = async (token: string, orderId: number): Promise<void> => {
  const payload = await request<ApiEnvelope<null>>(
    token,
    `/api/driver/orders/${orderId}/accept`,
    {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    },
    'Không thể nhận đơn hàng.'
  );

  if (!payload.success) {
    throw new Error(payload.message || 'Không thể nhận đơn hàng.');
  }
};

export const rejectOrder = async (token: string, orderId: number, reason?: string): Promise<void> => {
  const payload = await request<ApiEnvelope<null>>(
    token,
    `/api/driver/orders/${orderId}/reject`,
    {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, reason: reason || null }),
    },
    'Không thể từ chối đơn hàng.'
  );

  if (!payload.success) {
    throw new Error(payload.message || 'Không thể từ chối đơn hàng.');
  }
};

export const markOrderDelivered = async (token: string, orderId: number): Promise<void> => {
  const payload = await request<ApiEnvelope<null>>(
    token,
    `/api/driver/orders/${orderId}/delivered`,
    {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    },
    'Không thể xác nhận đã giao đơn.'
  );

  if (!payload.success) {
    throw new Error(payload.message || 'Không thể xác nhận đã giao đơn.');
  }
};

export const getMyOrders = async (
  token: string,
  scope: 'active' | 'history'
): Promise<DriverOrder[]> => {
  const payload = await request<ApiEnvelope<DriverOrder[]>>(
    token,
    `/api/driver/my-orders?scope=${scope}`,
    { method: 'GET' },
    'Không thể tải danh sách đơn của tài xế.'
  );

  if (!payload.success) {
    throw new Error(payload.message || 'Không thể tải danh sách đơn của tài xế.');
  }

  return payload.data || [];
};

export const getWalletSummary = async (token: string): Promise<WalletSummary> => {
  const payload = await request<ApiEnvelope<WalletSummary>>(
    token,
    '/api/driver/wallet/summary',
    { method: 'GET' },
    'Không thể tải dữ liệu ví tài xế.'
  );

  if (!payload.success || !payload.data) {
    throw new Error(payload.message || 'Không thể tải dữ liệu ví tài xế.');
  }

  return payload.data;
};
