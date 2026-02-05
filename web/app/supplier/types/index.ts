/**
 * ============================================
 * SUPPLIER TYPES & INTERFACES
 * ============================================
 * Định nghĩa types cho supplier portal (restaurant owners)
*/

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  email?: string;
  description?: string;
  image_url?: string;
  rating: number;
  total_reviews: number;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  delivery_time: string;
  delivery_fee: number;
  min_order_value?: number;
  opening_time?: string;
  closing_time?: string;
  created_at: string;
  updated_at?: string;
  latitude?: number;
  longitude?: number;
}

export interface Food {
  food_id: number;
  food_name: string;
  description: string;
  price: number;
  image_url?: string;
  category_id?: number;
  category_name?: string;
  is_available: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Order {
  order_id: number;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  total_amount: number;
  order_status: 'pending' | 'processing' | 'delivering' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
  notes?: string;
}

export interface OrderItem {
  order_item_id: number;
  food_id: number;
  food_name: string;
  food_price: number;
  quantity: number;
  subtotal: number;
}

export interface SupplierStats {
  revenue: {
    total: number;
    today: number;
  };
  orders: {
    total_orders: number;
    today_orders: number;
    pending_orders: number;
  };
  foods: {
    total_foods: number;
    available_foods: number;
  };
  rating: {
    average: number;
    count: number;
  };
}

export interface FoodCategory {
  category_id: number;
  category_name: string;
  description?: string;
}

export interface Promotion {
  promotion_id: number;
  promotion_name: string;
  discount_percent: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface Review {
  review_id: number;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  food_name?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: PaginationMeta;
}

export interface FoodsResponse {
  foods: Food[];
  pagination: PaginationMeta;
}

// supplier / nhà hàng đối tác của dịch vụ
export interface SupplierUser {
  user_id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  role: 'restaurant_owner';
  restaurant_name?: string;
  restaurant_id?: number;
}
