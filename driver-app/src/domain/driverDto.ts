export type DriverRole = 'driver';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export type LatLng = {
  lat: number;
  lng: number;
};

export type DriverUser = {
  user_id: number;
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
};

export type RestaurantMapPoint = {
  restaurant_id: number;
  name: string;
  latitude: number;
  longitude: number;
};

export type CustomerMapPoint = {
  user_id: number;
  full_name: string;
  latitude: number | null;
  longitude: number | null;
  delivery_address: string;
  phone_number?: string;
  note?: string;
};

export type VirtualCandidateDTO = {
  candidate_idx: number;
  latitude: number;
  longitude: number;
};

export type DeliveringOrderDTO = {
  order_id: number;
  order_code: string;
  order_status: OrderStatus;
  restaurant: RestaurantMapPoint;
  customer: {
    user_id: number;
    full_name: string;
    delivery_address: string;
    phone_number?: string;
  };
  selected_virtual_candidate?: {
    candidate_idx: number;
    latitude: number;
    longitude: number;
  };
};

export type DeliveredOrderHistoryDTO = {
  order_id: number;
  order_code: string;
  restaurant_name: string;
  customer_name: string;
  delivery_address: string;
  delivered_at: string;
  payout_amount: number;
};

export type DriverProfileDTO = {
  user_id: number;
  full_name: string;
  phone_number: string;
  email: string;
  vehicle_type: string;
  vehicle_plate: string;
  rating: number;
  completed_orders: number;
  joined_at: string;
};

export type OrderMapDTO = {
  order_id: number;
  order_code: string;
  order_status: OrderStatus;
  restaurant: RestaurantMapPoint;
  customer: CustomerMapPoint;
  virtual_candidates: VirtualCandidateDTO[];
  selected_virtual_candidate_idx: number;
  // Nếu backend đã gán driver thật tương ứng candidate, app dùng để hiển thị/điều hướng.
  assigned_driver?: DriverUser | null;
};

export type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  errors?: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

