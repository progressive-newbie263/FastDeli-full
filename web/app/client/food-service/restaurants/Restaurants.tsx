'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Restaurant } from '../interfaces';
// ✅ THAY ĐỔI: Dùng Lucide thay vì React Icons (nhẹ hơn 90%)
import { MapPin, Phone, Star, Truck, Clock } from 'lucide-react';
import { getOptimizedCloudinaryUrl, isCloudinaryUrl, getBlurDataURL } from '../utils/imageUtils';

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
      {restaurants.map((restaurant) => {
        const imageUrl = getOptimizedCloudinaryUrl(restaurant.image_url, 400);
        const isCloudinary = isCloudinaryUrl(restaurant.image_url);

        return (
          <Link
            key={restaurant.id}
            href={`/client/food-service/restaurants/${restaurant.id}`}
            className="block rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-white group"
          >
            <div className="relative w-full h-48 overflow-hidden">
              <Image
                src={imageUrl}
                alt={restaurant.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                quality={75}
                unoptimized={isCloudinary}
                placeholder="blur"
                blurDataURL={getBlurDataURL()}
              />
            </div>

            <div className="p-4">
              <h3 className="text-xl font-semibold mb-1 line-clamp-1 group-hover:text-green-600 transition-colors">
                {restaurant.name}
              </h3>

              <p className="text-sm text-gray-600 mb-2 flex items-center gap-1 line-clamp-1">
                {/* ✅ THAY ĐỔI: Dùng Lucide icons */}
                <MapPin className="text-red-500 w-4 h-4 flex-shrink-0" />
                {restaurant.address}
              </p>

              <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                <Phone className="text-green-500 w-4 h-4 flex-shrink-0" />
                {restaurant.phone}
              </p>

              <div className="flex items-center text-sm text-gray-700 mb-1 justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="text-gray-500 w-4 h-4 flex-shrink-0" />
                  {restaurant.delivery_time}
                </span>

                <span className="flex items-center gap-1 font-medium text-blue-600">
                  <Truck className="w-4 h-4 flex-shrink-0" />
                  {parseInt(restaurant.delivery_fee).toLocaleString()}đ
                </span>
              </div>

              <div className="flex items-center text-sm text-yellow-600 font-medium gap-1 mt-1">
                <Star className="w-4 h-4 flex-shrink-0 fill-yellow-600" />
                {parseFloat(restaurant.rating).toFixed(1)} 
                <span className="text-gray-500 font-normal">
                  ({restaurant.total_reviews.toLocaleString()})
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default RestaurantList;