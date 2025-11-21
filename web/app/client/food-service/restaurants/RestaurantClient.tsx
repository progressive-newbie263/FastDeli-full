'use client'

import React, { useEffect, useState } from 'react';
import RestaurantList from './Restaurants';
import { Restaurant } from '../interfaces';


const RestaurantClient = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    fetch('http://localhost:5001/api/restaurants')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRestaurants(data.data.restaurants);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <main className="w-full max-w-screen-2xl mx-auto py-24 lg:px-32 md:px-18 px-12">
      <h1 className="text-3xl font-bold">Danh sách nhà hàng</h1>
      
      <RestaurantList restaurants={restaurants} />
    </main>
  );
};

export default RestaurantClient;