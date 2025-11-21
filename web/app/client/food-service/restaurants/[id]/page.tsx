import { Metadata } from "next";
import RestaurantDetailClient from "./RestaurantDetailClient";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`http://localhost:5001/api/restaurants/${params.id}`, {
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

export default function RestaurantDetailPage({ params }: { params: { id: string } }) {
  return <RestaurantDetailClient restaurantId={params.id} />;
}