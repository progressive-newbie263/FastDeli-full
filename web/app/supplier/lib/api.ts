/**
 * ============================================
 * SUPPLIER API UTILITIES
 * ============================================
 * API functions để gọi backend services cho supplier portal
 */

import type {
  Restaurant,
  Food,
  Order,
  SupplierStats,
  OrdersResponse,
  FoodsResponse,
  FoodCategory,
  Promotion,
  Review,
  ApiResponse,
} from '../types';
import { MOCK_RESTAURANT, MOCK_FOODS, MOCK_ORDERS, MOCK_STATS, MOCK_CATEGORIES } from './mockData';

const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:5000';
const FOOD_API_URL = process.env.NEXT_PUBLIC_FOOD_API_URL || 'http://localhost:5001';

// Flag để bật/tắt mock mode - ĐỔI THÀNH FALSE ĐỂ DÙNG API THẬT
const USE_MOCK_DATA = false;

class SupplierAPI {
  /**
   * Get auth headers với JWT token
   */
  private static getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('supplier_token') : null;
    if (typeof window !== 'undefined') {
      console.log('SupplierAPI: Getting auth token:', token ? token.substring(0, 10) + '...' : 'null');
    }
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Clear auth token khi logout
   */
  static clearAuth() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supplier_token');
      localStorage.removeItem('supplier_user');
      localStorage.removeItem('supplier_restaurant_id');
    }
  }

  // ============================================
  // AUTH APIs
  // ============================================

  /**
   * Login cho restaurant owners
   */
  static async login(email: string, password: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${AUTH_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        // Kiểm tra role phải là restaurant_owner
        if (data.user?.role !== 'restaurant_owner') {
          return {
            success: false,
            message: 'Tài khoản không có quyền truy cập supplier portal',
          };
        }

        // Lưu token và user info
        localStorage.setItem('supplier_token', data.token);
        localStorage.setItem('supplier_user', JSON.stringify(data.user));
        
        // Lưu restaurant_id nếu có
        if (data.user.restaurant_id) {
          localStorage.setItem('supplier_restaurant_id', data.user.restaurant_id.toString());
        }
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi kết nối đến server',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${AUTH_API_URL}/api/auth/profile`, {
        headers: this.getAuthHeaders(),
      });
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể lấy thông tin người dùng',
      };
    }
  }

  // ============================================
  // RESTAURANT APIs
  // ============================================

  /**
   * Lấy thông tin nhà hàng của supplier
   */
  static async getMyRestaurant(): Promise<ApiResponse<Restaurant>> {
    // Mock mode: Return mock data
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
      return {
        success: true,
        message: 'Lấy thông tin nhà hàng thành công',
        data: MOCK_RESTAURANT,
      };
    }

    // Real API call
    try {
      const response = await fetch(`${FOOD_API_URL}/api/supplier/my-restaurant`, {
        headers: this.getAuthHeaders(),
      });
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể lấy thông tin nhà hàng',
      };
    }
  }

  /**
   * Cập nhật thông tin nhà hàng
   */
  static async updateRestaurant(restaurantId: number, data: Partial<Restaurant>): Promise<ApiResponse<Restaurant>> {
    // Mock mode: Return updated restaurant data
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      const updatedRestaurant = { ...MOCK_RESTAURANT, ...data };
      return {
        success: true,
        message: 'Cập nhật thông tin nhà hàng thành công',
        data: updatedRestaurant,
      };
    }

    // Real API call
    try {
      const response = await fetch(`${FOOD_API_URL}/api/supplier/restaurants/${restaurantId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể cập nhật nhà hàng',
      };
    }
  }

  // ============================================
  // FOOD/MENU APIs
  // ============================================

  /**
   * Lấy danh sách món ăn của nhà hàng
   */
  static async getMyFoods(restaurantId: number, page = 1, limit = 20): Promise<ApiResponse<FoodsResponse>> {
    // Mock mode: Return mock data
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate delay
      return {
        success: true,
        message: 'Lấy danh sách món ăn thành công',
        data: {
          foods: MOCK_FOODS,
          pagination: {
            page,
            limit,
            total: MOCK_FOODS.length,
            totalPages: Math.ceil(MOCK_FOODS.length / limit),
          },
        },
      };
    }

    // Real API call
    try {
      const response = await fetch(
        `${FOOD_API_URL}/api/supplier/restaurants/${restaurantId}/foods?page=${page}&limit=${limit}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể lấy danh sách món ăn',
      };
    }
  }

  /**
   * Tạo món ăn mới
   */
  static async createFood(restaurantId: number, foodData: Partial<Food>): Promise<ApiResponse<Food>> {
    // Mock mode: Return new food with generated ID
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate delay
      const newFood: Food = {
        food_id: MOCK_FOODS.length + 1,
        food_name: foodData.food_name || 'Món mới',
        description: foodData.description || '',
        price: foodData.price || 0,
        image_url: foodData.image_url,
        category_id: foodData.category_id,
        category_name: MOCK_CATEGORIES.find(c => c.category_id === foodData.category_id)?.category_name,
        is_available: foodData.is_available ?? true,
        created_at: new Date().toISOString(),
      };
      return {
        success: true,
        message: 'Tạo món ăn thành công',
        data: newFood,
      };
    }

    // Real API call
    try {
      const response = await fetch(`${FOOD_API_URL}/api/supplier/restaurants/${restaurantId}/foods`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(foodData),
      });
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể tạo món ăn',
      };
    }
  }

  /**
   * Cập nhật món ăn
   */
  static async updateFood(foodId: number, foodData: Partial<Food>): Promise<ApiResponse<Food>> {
    // Mock mode: Return updated food data
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      const existingFood = MOCK_FOODS.find(f => f.food_id === foodId);
      if (!existingFood) {
        return {
          success: false,
          message: 'Không tìm thấy món ăn',
        };
      }
      const updatedFood: Food = {
        ...existingFood,
        ...foodData,
        category_name: foodData.category_id
          ? MOCK_CATEGORIES.find(c => c.category_id === foodData.category_id)?.category_name
          : existingFood.category_name,
      };
      return {
        success: true,
        message: 'Cập nhật món ăn thành công',
        data: updatedFood,
      };
    }

    // Real API call
    try {
      const response = await fetch(`${FOOD_API_URL}/api/supplier/foods/${foodId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(foodData),
      });
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể cập nhật món ăn',
      };
    }
  }

  /**
   * Xóa món ăn
   */
  static async deleteFood(foodId: number): Promise<ApiResponse> {
    // Mock mode: Return success
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate delay
      const foodExists = MOCK_FOODS.find(f => f.food_id === foodId);
      if (!foodExists) {
        return {
          success: false,
          message: 'Không tìm thấy món ăn',
        };
      }
      return {
        success: true,
        message: 'Xóa món ăn thành công',
      };
    }

    // Real API call
    try {
      const response = await fetch(`${FOOD_API_URL}/api/supplier/foods/${foodId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể xóa món ăn',
      };
    }
  }

  /**
   * Toggle food availability (available/unavailable)
   */
  static async toggleFoodAvailability(foodId: number, isAvailable: boolean): Promise<ApiResponse> {
    // Mock mode: Return success
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
      const foodExists = MOCK_FOODS.find(f => f.food_id === foodId);
      if (!foodExists) {
        return {
          success: false,
          message: 'Không tìm thấy món ăn',
        };
      }
      return {
        success: true,
        message: 'Cập nhật trạng thái món ăn thành công',
      };
    }

    // Real API call
    try {
      const response = await fetch(`${FOOD_API_URL}/api/supplier/foods/${foodId}/availability`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ is_available: isAvailable }),
      });
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể cập nhật trạng thái món ăn',
      };
    }
  }

  // ============================================
  // ORDER APIs
  // ============================================

  /**
   * Lấy danh sách đơn hàng của nhà hàng
   */
  static async getMyOrders(
    restaurantId: number,
    page = 1,
    limit = 20,
    status?: string
  ): Promise<ApiResponse<OrdersResponse>> {
    // Mock mode: Return mock data
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      
      let filteredOrders = MOCK_ORDERS;
      if (status) {
        filteredOrders = MOCK_ORDERS.filter(order => order.order_status === status);
      }
      
      return {
        success: true,
        message: 'Lấy danh sách đơn hàng thành công',
        data: {
          orders: filteredOrders,
          pagination: {
            page,
            limit,
            total: filteredOrders.length,
            totalPages: Math.ceil(filteredOrders.length / limit),
          },
        },
      };
    }

    // Real API call
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
      });

      const response = await fetch(
        `${FOOD_API_URL}/api/supplier/restaurants/${restaurantId}/orders?${params}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể lấy danh sách đơn hàng',
      };
    }
  }

  /**
   * Lấy chi tiết đơn hàng
   */
  static async getOrderDetail(orderId: number): Promise<ApiResponse<Order>> {
    try {
      const response = await fetch(`${FOOD_API_URL}/api/supplier/orders/${orderId}`, {
        headers: this.getAuthHeaders(),
      });
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể lấy chi tiết đơn hàng',
      };
    }
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  static async updateOrderStatus(orderId: number, status: string): Promise<ApiResponse> {
    // Mock mode: Return success
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      const orderExists = MOCK_ORDERS.find(o => o.order_id === orderId);
      if (!orderExists) {
        return {
          success: false,
          message: 'Không tìm thấy đơn hàng',
        };
      }
      return {
        success: true,
        message: 'Cập nhật trạng thái đơn hàng thành công',
      };
    }

    // Real API call
    try {
      const response = await fetch(`${FOOD_API_URL}/api/supplier/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ order_status: status }),
      });
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể cập nhật trạng thái đơn hàng',
      };
    }
  }

  // ============================================
  // STATISTICS APIs
  // ============================================

  /**
   * Lấy thống kê dashboard
   */
  static async getStatistics(restaurantId: number): Promise<ApiResponse<SupplierStats>> {
    // Mock mode: Return mock data
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate delay
      return {
        success: true,
        message: 'Lấy thống kê thành công',
        data: MOCK_STATS,
      };
    }

    // Real API call
    try {
      const response = await fetch(`${FOOD_API_URL}/api/supplier/restaurants/${restaurantId}/statistics`, {
        headers: this.getAuthHeaders(),
      });
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể lấy thống kê',
      };
    }
  }

  /**
   * Lấy dữ liệu biểu đồ doanh thu
   */
  static async getRevenueChart(restaurantId: number, days = 7): Promise<ApiResponse> {
    try {
      const response = await fetch(
        `${FOOD_API_URL}/api/supplier/restaurants/${restaurantId}/revenue-chart?days=${days}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể lấy dữ liệu biểu đồ',
      };
    }
  }

  // ============================================
  // CATEGORY APIs
  // ============================================

  /**
   * Lấy danh sách categories
   */
  static async getCategories(): Promise<ApiResponse<FoodCategory[]>> {
    // Mock mode: Return mock categories
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
      return {
        success: true,
        message: 'Lấy danh sách danh mục thành công',
        data: MOCK_CATEGORIES,
      };
    }

    // Real API call
    try {
      const response = await fetch(`${FOOD_API_URL}/api/categories`, {
        headers: this.getAuthHeaders(),
      });
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể lấy danh sách danh mục',
      };
    }
  }

  // ============================================
  // REVIEWS APIs (future)
  // ============================================

  /**
   * Lấy reviews của nhà hàng
   */
  static async getReviews(restaurantId: number, page = 1, limit = 20): Promise<ApiResponse> {
    try {
      const response = await fetch(
        `${FOOD_API_URL}/api/supplier/restaurants/${restaurantId}/reviews?page=${page}&limit=${limit}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể lấy đánh giá',
      };
    }
  }
}

export default SupplierAPI;
