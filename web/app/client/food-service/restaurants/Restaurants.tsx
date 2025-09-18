'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Restaurant } from '../interfaces';
import { FaMapMarkerAlt, FaPhoneAlt, FaStar, FaTruck } from 'react-icons/fa';
import { MdAccessTime } from 'react-icons/md';


interface RestaurantListProps {
  restaurants: Restaurant[];
}

const RestaurantList: React.FC<RestaurantListProps> = ({ restaurants }) => {
  return (
    <div className="grid 
      grid-cols-1 
      sm:grid-cols-2 
      lg:grid-cols-3 
      xl:grid-cols-4 
      gap-6 py-10
    ">
      {restaurants.map((restaurant) => (
        <Link
          key={restaurant.id}
          href={`/client/food-service/restaurants/${restaurant.id}`}
          className="block rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white"
        >
          <div className="relative w-full h-48">
            <Image
              src={restaurant.image_url || ''}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="p-4">
            <h3 className="text-xl font-semibold mb-1">
              {restaurant.name}
            </h3>

            <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
              <FaMapMarkerAlt className="text-red-500" />
              {restaurant.address}
            </p>

            <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
              <FaPhoneAlt className="text-green-500" />
              {restaurant.phone}
            </p>

            <div className="flex items-center text-sm text-gray-700 mb-1 justify-between">
              <span className="flex items-center gap-1">
                <MdAccessTime className="text-gray-500" />
                {restaurant.delivery_time}
              </span>

              <span className="flex items-center gap-1">
                <FaTruck className="text-blue-500" />
                {parseInt(restaurant.delivery_fee).toLocaleString()}đ
              </span>
            </div>

            <div className="flex items-center text-sm text-yellow-600 font-medium gap-1 mt-1">
              <FaStar />
              {parseFloat(restaurant.rating).toFixed(1)} ({restaurant.total_reviews.toLocaleString()} đánh giá)
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RestaurantList;
