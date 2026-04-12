import { Metadata } from "next";
import RestaurantDetailClient from "./RestaurantDetailClient";

export async function generateMetadata({ params }: { 
  params: Promise<{ id: string }>; 
}): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const res = await fetch(`http://localhost:5001/api/restaurants/${id}`, {
      cache: 'no-store'
    });

    const restaurant = await res.json();
    
    return {
      title: restaurant.name || 'Chi tiết nhà hàng',
      description: restaurant.description || 'Xem thực đơn và đặt món ngay',
    };
  } catch (error) {
    return {
      title: 'Chi tiết nhà hàng',
      description: 'Xem thực đơn và đặt món ngay',
    };
  }
}

export default async function RestaurantDetailPage({ params } : { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  return <RestaurantDetailClient restaurantId={id} />;
}