const ADMIN_FOOD_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const ADMIN_AUTH_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:5000';

class ApiService {
  private static getAuthHeaders(): HeadersInit {
    // thêm logic check. Đảm bảo code chỉ chạy trình duyệt
    if (typeof window === 'undefined') return {};
    
    const token = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // function để xóa token khi logout.
  // bổ sung method này vào để khi đăng xuất, xóa đi thông tin người dùng khỏi localStorage
  static clearAuth() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
    }
  }

  // Auth APIs
  static async login(email: string, password: string) {
    const response = await fetch(`${ADMIN_AUTH_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  /* ============================================================
     ADMIN RESTAURANT APIs
     ============================================================ */
  
  /* Lấy danh sách nhà hàng với phân trang (Admin) - pag, limit, filters (status, search query, ...) */
  static async getRestaurants(page = 1, limit = 10, filters?: Record<string, string>) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters || {}),
    });
    
    const response = await fetch(`${ADMIN_FOOD_URL}/api/admin/restaurants?${params}`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  /**
   * Lấy thống kê nhà hàng (Admin Dashboard)
   */
  static async getRestaurantStatistics() {
    const response = await fetch(`${ADMIN_FOOD_URL}/api/admin/restaurants/statistics`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  /**
   * Lấy chi tiết nhà hàng theo ID (Admin)
   */
  static async getRestaurantById(id: string) {
    const response = await fetch(`${ADMIN_FOOD_URL}/api/admin/restaurants/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  /*
    lấy các món ăn của nhà hàng theo ID nhà hàng (Admin)
    api: GET /api/admin/restaurants/:id/foods
  */
  static async getRestaurantFoods(restaurantId: string) {
    const response = await fetch(`${ADMIN_FOOD_URL}/api/admin/restaurants/${restaurantId}/foods`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  /**
   * Cập nhật trạng thái nhà hàng (Admin)
   * @param id - ID nhà hàng
   * @param status - active | inactive | pending | rejected
   * @param reason - Lý do từ chối (bắt buộc nếu status = 'rejected')
   */
  static async updateRestaurantStatus(id: string, status: string, reason?: string) {
    const response = await fetch(`${ADMIN_FOOD_URL}/api/admin/restaurants/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, reason }),
    });
    return response.json();
  }

  /**
   * Phê duyệt nhà hàng (Admin)
   */
  static async approveRestaurant(id: string) {
    const response = await fetch(`${ADMIN_FOOD_URL}/api/admin/restaurants/${id}/approve`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  /**
   * Từ chối nhà hàng (Admin)
   * @param id - ID nhà hàng
   * @param reason - Lý do từ chối (bắt buộc)
   */
  static async rejectRestaurant(id: string, reason: string) {
    const response = await fetch(`${ADMIN_FOOD_URL}/api/admin/restaurants/${id}/reject`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return response.json();
  }

  /*
    ============================================================ 
    FOOD APIs 
    ============================================================
  */
  static async getFoods(filters?: Record<string, string>) {
    const queryParams = new URLSearchParams(filters || {}).toString();
    const response = await fetch(`${ADMIN_FOOD_URL}/api/foods?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  static async updateFoodStatus(id: string, isAvailable: boolean) {
    const response = await fetch(`${ADMIN_FOOD_URL}/api/foods/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ is_available: isAvailable }),
    });
    return response.json();
  }


  /*
    ============================================================ 
    ORDER APIs 
    ============================================================
  */
  static async getOrders(filters?: Record<string, string>) {
    const queryParams = new URLSearchParams(filters || {}).toString();
    const response = await fetch(`${ADMIN_FOOD_URL}/api/orders?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  static async updateOrderStatus(id: string, status: string) {
    const response = await fetch(`${ADMIN_FOOD_URL}/api/orders/${id}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ order_status: status }),
    });
    return response.json();
  }

  /*
    ============================================================ 
    DASHBOARD APIs 
    ============================================================
  */
  /**
   * Lấy tổng hợp thống kê dashboard
   * Bao gồm cả restaurant statistics
   */
  static async getDashboardStats() {
    try {
      const [dashboardRes, restaurantStatsRes] = await Promise.all([
        fetch(`${ADMIN_FOOD_URL}/api/admin/dashboard`, {
          headers: this.getAuthHeaders(),
        }),
        fetch(`${ADMIN_FOOD_URL}/api/admin/restaurants/statistics`, {
          headers: this.getAuthHeaders(),
        })
      ]);

      const dashboard = await dashboardRes.json();
      const restaurantStats = await restaurantStatsRes.json();

      return {
        ...dashboard,
        restaurantStats: restaurantStats.data || restaurantStats
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
}

export default ApiService;