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
  order_status: 'pending' | 'confirmed' | 'preparing' | 'shipping' | 'delivered' | 'cancelled';
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
  * update: bổ sung các interface liên quan đến "user".
*/
export interface User {
  user_id: number;
  name: string;
  email: string;
  phone: string;
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