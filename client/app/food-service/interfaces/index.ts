export interface Restaurant {
  id: number;
  name: string;
  address: string;
  image_url: string | null;
  delivery_fee: string;
  rating: string;
  total_reviews: number;
  is_featured: boolean;
  created_at: string; // cứ set string, mặc đù bên postgre để "timestamp without time zone"
  status: string; // xóa bỏ cột is_active boolean đi. status string bao rộng hơn.
  
  // tạm thời xóa bỏ cái này.
  //delivery_time: string;
  
  // bổ sung
  delivery_time_min?: number | null;
  delivery_time_max?: number | null;

  // Các field riêng cho trang chi tiết:
  phone?: string;
  description?: string;
  avg_rating?: string;
  review_count?: string;
  opening_time?: string;
  closing_time?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  euclidean_distance?: number | string | null;
  distance_km?: number | null;
}

export interface Food {
  food_id: number;
  food_name: string;
  description: string;
  price: string;
  image_url: string | null;
}
