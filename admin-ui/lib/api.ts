const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:5001';

class ApiService {
  private static getAuthHeaders() {
    // thêm logic check. Đảm bảo code chỉ chạy trình duyệt
    if (typeof window === 'undefined') return {};
    
    const token = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
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
    const response = await fetch(`${AUTH_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  // Restaurant APIs
  static async getRestaurants(filters?: any) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/api/restaurants?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  static async getRestaurantById(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/restaurants/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  static async updateRestaurantStatus(id: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/api/restaurants/${id}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return response.json();
  }

  // Food APIs
  static async getFoods(filters?: any) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/api/foods?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  static async updateFoodStatus(id: string, isAvailable: boolean) {
    const response = await fetch(`${API_BASE_URL}/api/foods/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ is_available: isAvailable }),
    });
    return response.json();
  }

  // Order APIs
  static async getOrders(filters?: any) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/api/orders?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  static async updateOrderStatus(id: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ order_status: status }),
    });
    return response.json();
  }

  // Dashboard Stats
  static async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }
}

export default ApiService;