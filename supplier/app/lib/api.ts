/*
  1 số supplier utils.
*/

import type {
  Restaurant,
  Food,
  Order,
  SupplierStats,
  OrdersResponse,
  FoodsResponse,
  FoodCategory,
  Review,
  ApiResponse,
  FoodNutrition,
} from '../types';
import { MOCK_RESTAURANT, MOCK_FOODS, MOCK_ORDERS, MOCK_STATS, MOCK_CATEGORIES } from './mockData';

const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:5000';
const FOOD_API_URL = process.env.NEXT_PUBLIC_FOOD_API_URL || 'http://localhost:5001';

// Flag để bật/tắt mock mode 
// set false để sử dụng API thật, true để sử dụng dữ liệu tạo sẵn (mock data)
const USE_MOCK_DATA = false;

class SupplierAPI {
  /* 
    Lấy auth headers với token jwt
  */
  private static getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('supplier_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private static getAuthOnlyHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('supplier_token') : null;
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /* 
    Đăng xuất sẽ xóa token và user info khỏi localStorage.
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


  // login cho supplier/ nhà hàng
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

  static async registerPartner(payload: {
    full_name: string;
    email: string;
    phone_number: string;
    password: string;
    restaurant_name: string;
    restaurant_address: string;
    restaurant_phone: string;
    description?: string;
    image_url?: string;
    delivery_time_min?: number;
    delivery_time_max?: number;
    min_order_value?: number;
    delivery_fee?: number;
    latitude?: number;
    longitude?: number;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${FOOD_API_URL}/api/supplier/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi kết nối đến server khi đăng ký đối tác',
      };
    }
  }

  // ============================================
  // RESTAURANT APIs
  // ============================================

  /*
    Lấy thông tin nhà hàng (supplier)
  */
  static async getMyRestaurant(): Promise<ApiResponse<Restaurant>> {
    // test data ảo.
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        message: 'Lấy thông tin nhà hàng thành công',
        data: MOCK_RESTAURANT,
      };
    }

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

  /*
    Cập nhật thông tin nhà hàng
  */
  static async updateRestaurant(restaurantId: number, data: Partial<Restaurant>): Promise<ApiResponse<Restaurant>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      const updatedRestaurant = { ...MOCK_RESTAURANT, ...data };
      
      return {
        success: true,
        message: 'Cập nhật thông tin nhà hàng thành công',
        data: updatedRestaurant,
      };
    }

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

  /*
    Lấy danh sách món ăn của nhà hàng
  */
  static async getMyFoods(restaurantId: number, page = 1, limit = 20): Promise<ApiResponse<FoodsResponse>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
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

  /*
    Tạo món ăn mới
  */
  static async createFood(restaurantId: number, foodData: Partial<Food>): Promise<ApiResponse<Food>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 600));
      
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

    try {
      const payload = {
        ...foodData,
        name: foodData.food_name,
      };

      const response = await fetch(`${FOOD_API_URL}/api/supplier/restaurants/${restaurantId}/foods`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể tạo món ăn',
      };
    }
  }

  /*
    Cập nhật món ăn
  */
  static async updateFood(foodId: number, foodData: Partial<Food>): Promise<ApiResponse<Food>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
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

    try {
      const payload = {
        ...foodData,
        name: foodData.food_name,
      };

      const response = await fetch(`${FOOD_API_URL}/api/supplier/foods/${foodId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể cập nhật món ăn',
      };
    }
  }

  static async deleteFood(foodId: number): Promise<ApiResponse> {
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

  /*
    Toggle trạng thái món ăn (có bán/ ko bán)
  */
  static async toggleFoodAvailability(foodId: number, isAvailable: boolean): Promise<ApiResponse> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
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

  /*
    Lấy danh sách đơn hàng (Nhà hàng)
  */
  static async getMyOrders(
    restaurantId: number,
    page = 1,
    limit = 20,
    status?: string
  ): Promise<ApiResponse<OrdersResponse>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
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

  /*
    chi tiết đơn hàng
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

  /*
    Cập nhật trạng thái đơn hàng
  */
  static async updateOrderStatus(orderId: number, status: string): Promise<ApiResponse> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
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

    try {
      const response = await fetch(`${FOOD_API_URL}/api/supplier/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ 
          status, 
          order_status: status 
        }),

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

  /*
    Lấy thống kê dashboard
  */
  static async getStatistics(restaurantId: number, days = 7): Promise<ApiResponse<SupplierStats>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate delay
      return {
        success: true,
        message: 'Lấy thống kê thành công',
        data: MOCK_STATS,
      };
    }

    try {
      const response = await fetch(`${FOOD_API_URL}/api/supplier/restaurants/${restaurantId}/statistics?days=${days}`, {
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

  /*
    Lấy dữ liệu biểu đồ doanh thu
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

  static async getCategories(): Promise<ApiResponse<FoodCategory[]>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        message: 'Lấy danh sách danh mục thành công',
        data: MOCK_CATEGORIES,
      };
    }

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

  // ============================================
  // SUPPLIER COUPON APIs
  // ============================================

  static async getMyCoupons(restaurantId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(
        `${FOOD_API_URL}/api/supplier/restaurants/${restaurantId}/coupons`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể lấy danh sách coupon',
      };
    }
  }

  static async createMyCoupon(
    restaurantId: number,
    payload: {
      code: string;
      title?: string;
      description?: string;
      image_url?: string;
      discount_type: 'percentage' | 'fixed_amount';
      discount_value: number;
      min_order_value?: number;
      max_discount?: number | null;
      start_date: string;
      end_date: string;
      is_active?: boolean;
    }
  ): Promise<ApiResponse> {
    try {
      const response = await fetch(
        `${FOOD_API_URL}/api/supplier/restaurants/${restaurantId}/coupons`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể tạo coupon',
      };
    }
  }

  static async updateMyCoupon(
    restaurantId: number,
    couponId: number,
    payload: {
      code?: string;
      title?: string;
      description?: string;
      image_url?: string;
      discount_type?: 'percentage' | 'fixed_amount';
      discount_value?: number;
      min_order_value?: number;
      max_discount?: number | null;
      start_date?: string;
      end_date?: string;
      is_active?: boolean;
    }
  ): Promise<ApiResponse> {
    try {
      const response = await fetch(
        `${FOOD_API_URL}/api/supplier/restaurants/${restaurantId}/coupons/${couponId}`,
        {
          method: 'PATCH',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể cập nhật coupon',
      };
    }
  }

  // ============================================
  // NUTRITION APIs
  // ============================================

  static async getFoodNutrition(foodId: number): Promise<ApiResponse<FoodNutrition>> {
    try {
      const response = await fetch(`${FOOD_API_URL}/api/supplier/foods/${foodId}/nutrition`, {
        headers: this.getAuthHeaders(),
      });
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể lấy thông tin dinh dưỡng',
      };
    }
  }

  static async upsertFoodNutrition(foodId: number, nutritionData: Partial<FoodNutrition>): Promise<ApiResponse<FoodNutrition>> {
    try {
      const response = await fetch(`${FOOD_API_URL}/api/supplier/foods/${foodId}/nutrition`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(nutritionData),
      });
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể lưu thông tin dinh dưỡng',
      };
    }
  }

  static async deleteFoodNutrition(foodId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${FOOD_API_URL}/api/supplier/foods/${foodId}/nutrition`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể xóa thông tin dinh dưỡng',
      };
    }
  }

  static async calculateNutritionFromName(foodName: string): Promise<ApiResponse<Partial<FoodNutrition>>> {
    try {
      const response = await fetch(`${FOOD_API_URL}/api/supplier/foods/calculate-nutrition`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ foodName }),
      });
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể tính toán dinh dưỡng',
      };
    }
  }

  // ============================================
  // UPLOAD APIs
  // ============================================

  static async uploadFoodImage(foodId: number, imageFile: File): Promise<ApiResponse<{url: string}>> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${FOOD_API_URL}/api/food-upload/foods/${foodId}`, {
        method: 'POST',
        headers: this.getAuthOnlyHeaders(),
        body: formData,
        // Không set Content-Type header, browser sẽ tự động set với boundary
      });
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể upload ảnh',
      };
    }
  }

  /*
    Upload ảnh nhà hàng
  */
  static async uploadRestaurantImage(restaurantId: number, imageFile: File): Promise<ApiResponse<{url: string}>> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${FOOD_API_URL}/api/food-upload/restaurants/${restaurantId}`, {
        method: 'POST',
        headers: this.getAuthOnlyHeaders(),
        body: formData,
      });
      
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể upload ảnh',
      };
    }
  }

  static async uploadCouponImage(couponId: number, imageFile: File): Promise<ApiResponse<{url: string}>> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${FOOD_API_URL}/api/food-upload/coupons/${couponId}`, {
        method: 'POST',
        headers: this.getAuthOnlyHeaders(),
        body: formData,
      });

      return response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Không thể upload ảnh coupon',
      };
    }
  }
}

export default SupplierAPI;
