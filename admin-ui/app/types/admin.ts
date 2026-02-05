/**
 * ============================================
 * DASHBOARD
 * ============================================
*/

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeRestaurants: number;
  totalUsers: number;
  pendingOrders?: number;
  todayRevenue?: number;
  ordersTrend?: number;
  revenueTrend?: number;
}

export interface RecentOrder {
  order_id: number;
  order_code: string;
  total_amount: number;
  order_status: 'pending' | 'processing' | 'delivering' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  customer_name: string;
  restaurant_name: string;
}

export interface ChartDataPoint {
  date: string;
  orders: number;
  revenue: number;
}

/* 
  update
 * ============================================
 * DASHBOARD
 * ============================================
*/
export interface User {
  user_id: number;
  full_name: string;
  email: string;
  phone_number: string;
  role: 'customer' | 'restaurant_owner' | 'admin' | 'shipper';
  is_active: boolean;
  created_at: string;
  last_login?: string;
  total_orders?: number;
  total_spent?: number;
}

export interface UserDetail extends User {
  orders: RecentOrder[];
  stats: {
    total_orders: number;
    total_spent: number;
    avg_order_value: number;
  };
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}


/* 
  update
 * ============================================
 * restaurants
 * ============================================
*/
export interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
  image_url?: string;
  //banner_url?: string;
  rating: number;
  total_reviews: number;
  total_foods?: number;
  status: string; //'pending' | 'approved' | 'rejected' | 'inactive'
  
  // thời gian đăng kí/cập nhật gần nhất của nhà hàng
  created_at: string;
  updated_at: string;

  // áp dụng cho api phía admin (func getRestaurantsByIdAdmin)
  delivery_time: string;
  delivery_time_min: number;
  delivery_time_max: number;
  delivery_fee: string | number;
  min_order_value: string | number;
  
  // Operating hours
  opening_time: string;
  closing_time: string;
}

export interface RestaurantDetail extends Restaurant {
  stats: {
    total_foods: number;
    total_orders: number;
    total_revenue: number;
  };
  recent_orders: RecentOrder[];
}

export interface RestaurantsResponse {
  restaurants: Restaurant[];
  pagination: PaginationMeta;
}

/**
 * ============================================
 * ORDER TYPES
 * ============================================
 */
export interface Order {
  id: number;
  order_code: string;
  user_id: number;
  restaurant_id: number;
  user_name: string;
  user_phone: string;
  delivery_address: string;
  total_amount: number;
  delivery_fee?: number;
  order_status: 'pending' | 'processing' | 'delivering' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded'; // 'failed' cân nhắc thêm sau này
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  food_id: number;
  food_name: string;
  food_price: number;
  quantity: number;
  created_at: string;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: PaginationMeta;
}

/**
 * ============================================
 * FOOD TYPES
 * ============================================
 */
export interface Food {
  food_id: number;
  food_name: string;
  restaurant_id: number;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;

  /* 
    * bổ sung: 2 trường này hỗ trợ hiển thị 1 vài thông số nâng cao.
    primary_category và secondary_category. 
    
      *primary là thể loại thức ăn chính: ví dụ, món ăn là "cơm gà" 
    thì cơm hay gà sẽ là primary_category?
    
      *secondary là thể loại thức ăn phụ: ví dụ, món ăn là "cơm gà" 
    nếu cơm là primary_category thì gà sẽ là secondary_category

    * Nếu món ăn chỉ có 1 thể loại thì secondary_category sẽ là null
  */
  primary_category: {
    id: number;
    name: string;
  };
  secondary_category: {
    id: number;
    name: string;
  } | null;
}

/**
 * ============================================
 * SHARED/COMMON TYPES
 * ============================================
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode?: number;
}

/**
 * ============================================
 * ANALYTICS TYPES
 * ============================================
 */
export interface AnalyticsData {
  period: string;
  orders: number;
  revenue: number;
  restaurants: number;
  users: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}