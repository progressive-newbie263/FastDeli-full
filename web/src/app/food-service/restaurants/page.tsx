"use client"

import React, { useEffect, useState } from 'react';
import RestaurantList, { Restaurant } from './Restaurants';



const Page = () => {
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
    <main className="container mx-auto py-24 lg:px-32 md:px-24 px-12">
      <h1 className="text-3xl font-bold">Danh sách nhà hàng</h1>
      
      <RestaurantList restaurants={restaurants} />
    </main>
  );
};

export default Page;