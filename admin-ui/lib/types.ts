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
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  cuisine: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
  description?: string;
  rating?: number;
  totalOrders?: number;
  revenue?: number;
  documents?: RestaurantDocument[];
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
  customerName: string;
  customerId: string;
  customerPhone?: string;
  restaurantName: string;
  restaurantId: string;
  totalAmount: number;
  status: 'new' | 'processing' | 'completed' | 'cancelled' | 'delivering';
  createdAt: string;
  updatedAt?: string;
  deliveryAddress: string;
  //paymentMethod: 'cash' | 'card' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  items: OrderItem[];
  notes?: string;
  deliveryFee?: number;
  serviceFee?: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
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