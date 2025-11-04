export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer' | 'restaurant_owner';
  status: 'active' | 'inactive' | 'banned';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  totalOrders?: number;
  totalSpent?: number;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  image_url?: string;
  description?: string;
  is_active: boolean; 
  delivery_time?: string;
  delivery_fee?: number;
  rating?: number;
  total_reviews?: number;
  is_featured?: boolean;
  created_at: string;
}


export interface RestaurantDocument {
  id: string;
  type: 'business_license' | 'food_safety_cert' | 'tax_code' | 'other';
  name: string;
  url: string;
  uploadedAt: string;
}

export interface Order {
  id: string;
  order_code: string;
  user_id: number;
  restaurant_id: number; 
  user_name: string; 
  user_phone: string;
  delivery_address: string;
  total_amount: number;
  delivery_fee?: number;
  order_status: 'pending' | 'confirmed' | 'processing' | 'delivering' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  notes?: string;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
}


// order_id là number
// cái mã dạng chuỗi kí tự/string sẽ là "order_code"
export interface OrderItem {
  order_item_id: number;
  order_id: number;
  food_id: number;
  food_name: string;
  food_price: number;
  quantity: number;
  created_at: string;
}


export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalRestaurants: number;
  totalUsers: number;
  pendingOrders: number;
  pendingRestaurants: number;
  todayOrders: number;
  todayRevenue: number;
  ordersTrend: number;
  revenueTrend: number;
  restaurantsTrend: number;
  usersTrend: number;
}

export interface AnalyticsData {
  period: string;
  orders: number;
  revenue: number;
  restaurants: number;
  users: number;
}