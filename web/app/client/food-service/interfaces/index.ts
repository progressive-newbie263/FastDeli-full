
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
  
  // Các field riêng cho trang chi tiết:
  phone?: string;
  description?: string;
  avg_rating?: string;
  review_count?: string;
}

export interface Food {
  food_id: number;
  food_name: string;
  description: string;
  price: string;
  image_url: string | null;
}
