const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:5000';

export class APIError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'APIError';
  }
}

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function fetchAPI<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requireAuth = false, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Thêm token nếu cần auth
  if (requireAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // Xử lý response
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new APIError(
        response.status,
        data.message || data.error || 'API request failed',
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // Network error hoặc lỗi khác
    throw new APIError(
      0,
      error instanceof Error ? error.message : 'Network error',
      error
    );
  }
}

// Helper methods
export const api = {
  get: <T = any>(endpoint: string, requireAuth = false) =>
    fetchAPI<T>(endpoint, { method: 'GET', requireAuth }),

  post: <T = any>(endpoint: string, body: any, requireAuth = false) =>
    fetchAPI<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      requireAuth,
    }),

  put: <T = any>(endpoint: string, body: any, requireAuth = false) =>
    fetchAPI<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      requireAuth,
    }),

  delete: <T = any>(endpoint: string, requireAuth = false) =>
    fetchAPI<T>(endpoint, { method: 'DELETE', requireAuth }),
};