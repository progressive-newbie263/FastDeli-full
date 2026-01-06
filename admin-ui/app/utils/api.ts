import { RestaurantDetail, RestaurantsResponse, User } from "../types/admin";

const ADMIN_FOOD_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Fetch wrapper với error handling
 */
export async function fetchAPI<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${ADMIN_FOOD_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Parse JSON
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new APIError(
        response.status,
        data?.message || data?.error || `HTTP ${response.status}`,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Network error hoặc JSON parse error
    console.error('API Fetch Error:', error);
    throw new APIError(
      0,
      error instanceof Error ? error.message : 'Network error',
      error
    );
  }
}

/**
 * API helper methods
 */
export const adminAPI = {
  // Dashboard stats (thành công)
  getStats: () => 
    fetchAPI('/api/admin/stats'),
  
  // Recent orders (thành công)
  // ví dụ: http://localhost:5001/api/admin/recent-orders?limit=5
  getRecentOrders: (limit = 10) => 
    fetchAPI(`/api/admin/recent-orders?limit=${limit}`),
  
  // Chart data (7 days) (thành công, trả về chuỗi json null).
  getChartData: () => 
    fetchAPI('/api/admin/chart-data'),

  /* 
    thu thập restaurants 
  */
  getRestaurants: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<RestaurantsResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    
    return fetchAPI(`/api/admin/restaurants?${query.toString()}`);
  },

  /* 
    thông tin chi tiết nhà hàng 
  */
  getRestaurantDetail: (id: number): Promise<{
    restaurant: RestaurantDetail;
    owner: User;
    stats: {
      total_foods: number;
      total_orders: number;
      total_revenue: number;
    };
  }> => fetchAPI(`/api/admin/restaurants/${id}`),

  // duyệt hoặc từ chối nhà hàng
  approveRestaurant: (id: number) =>
    fetchAPI(`/api/admin/restaurants/${id}/approve`, { 
      method: 'PUT' 
    }),

  rejectRestaurant: (id: number, reason?: string) =>
    fetchAPI(`/api/admin/restaurants/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    }),

  toggleRestaurantActive: (id: number) =>
    fetchAPI(`/api/admin/restaurants/${id}/toggle-active`, { 
      method: 'PUT' 
    }),

  /*
    * phần bổ sung: users
    * Hiện tại đang bị 1 số vấn đề. Tạm thời đang thử nghiệm là chính
  */
  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) => {
    const query = new URLSearchParams();
    
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.role) query.append('role', params.role);
    
    return fetchAPI(`/api/admin/users?${query.toString()}`);
  },

  getUserDetail: (userId: number) => 
    fetchAPI(`/api/admin/users/${userId}`),

  updateUser: (userId: number, data: any) =>
    fetchAPI(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteUser: (userId: number) =>
    fetchAPI(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    }),
};