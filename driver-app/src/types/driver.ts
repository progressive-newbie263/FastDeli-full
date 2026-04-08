export type DriverProfile = {
  id: number;
  user_id: number;
  full_name: string;
  phone: string;
  status: 'online' | 'offline' | 'busy';
  rating: number;
  total_deliveries: number;
};

export type AvailableOrder = {
  order_id: number;
  order_code: string;
  restaurant_id: number;
  restaurant_name: string;
  restaurant_address: string;
  user_name: string;
  user_phone: string;
  delivery_address: string;
  delivery_fee: number;
  total_amount: number;
  order_status: string;
  restaurant_latitude: number;
  restaurant_longitude: number;
  distance_km: number;
};

export type DriverOrder = {
  assignment_id: number;
  assignment_status: 'accepted' | 'picking_up' | 'delivering' | 'completed' | 'cancelled';
  assigned_at: string;
  completed_at: string | null;
  order_id: number;
  order_code: string;
  order_status: string;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  user_name: string;
  user_phone: string;
  order_created_at: string;
  restaurant_id: number;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_latitude: number | null;
  restaurant_longitude: number | null;
  can_mark_delivered: boolean;
};

export type WalletDailyPoint = {
  day: string;
  amount: number;
};

export type WalletSummary = {
  available_balance: number;
  today_earnings: number;
  week_earnings: number;
  month_earnings: number;
  completed_orders_week: number;
  accepted_count_week: number;
  rejected_count_week: number;
  acceptance_rate_week: number | null;
  daily_breakdown: WalletDailyPoint[];
};
