export interface Restaurant {
  id: number;
  name: string;
  address: string;
  image_url: string | null;
  delivery_time: string;
  delivery_fee: string;
  rating: string;
  total_reviews: number;
  is_featured: boolean;
  created_at: string; // cứ set string, mặc đù bên postgre để "timestamp without time zone"
  status: string; // xóa bỏ cột is_active boolean đi. status string bao rộng hơn.
  
  // Các field riêng cho trang chi tiết:
  phone?: string;
  description?: string;
  avg_rating?: string;
  review_count?: string;
  opening_time?: string;
  closing_time?: string;
}

export interface Food {
  food_id: number;
  food_name: string;
  description: string;
  price: string;
  image_url: string | null;
}
