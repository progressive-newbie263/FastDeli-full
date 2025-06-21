'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface Restaurant {
  restaurant_id: number;
  restaurant_name: string;
  address: string;
  image_url: string | null;
  delivery_time: string;
  delivery_fee: string;     // Sửa: string vì từ API trả về là string
  rating: string;           // Sửa: string vì từ API trả về là string
  total_reviews: number;
  is_featured: boolean;
}

interface RestaurantListProps {
  restaurants: Restaurant[];
}

const RestaurantList: React.FC<RestaurantListProps> = ({ restaurants }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-10">
      {restaurants.map((restaurant) => (
        <Link
          key={restaurant.restaurant_id}
          href={`/food-service/restaurants/${restaurant.restaurant_id}`}
          className="block rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white"
        >
          <div className="relative w-full h-48">
            <Image
              src={restaurant.image_url || ''}
              alt={restaurant.restaurant_name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-1">{restaurant.restaurant_name}</h3>
            <p className="text-sm text-gray-600 mb-2">{restaurant.address}</p>

            <div className="flex items-center text-sm text-gray-700 mb-1">
              <span className="mr-2">⏱ {restaurant.delivery_time}</span>
              <span className="mr-2">
                💸 {parseInt(restaurant.delivery_fee).toLocaleString()}đ
              </span>
            </div>

            <div className="flex items-center text-sm text-yellow-600 font-medium">
              ⭐ {parseFloat(restaurant.rating).toFixed(1)} ({restaurant.total_reviews.toLocaleString()} đánh giá)
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RestaurantList;
