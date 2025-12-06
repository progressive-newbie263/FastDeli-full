'use client'

import React, { useEffect, useState } from 'react';
import RestaurantList from './Restaurants';
import { Restaurant } from '../interfaces';

// ✅ Constants cho cache
const CACHE_KEY = 'restaurants_cache';
const CACHE_TIME_KEY = 'restaurants_cache_time';
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

const RestaurantClient = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // ✅ THÊM: Kiểm tra cache trong sessionStorage
        const cached = sessionStorage.getItem(CACHE_KEY);
        const cacheTime = sessionStorage.getItem(CACHE_TIME_KEY);
        
        if (cached && cacheTime) {
          const age = Date.now() - parseInt(cacheTime);
          if (age < CACHE_DURATION) {
            console.log('✅ Using cached restaurants data');
            setRestaurants(JSON.parse(cached));
            setLoading(false);
            return;
          }
        }

        // ✅ THÊM: Log khi fetch mới
        console.log('🔄 Fetching fresh restaurants data');
        
        const res = await fetch('http://localhost:5001/api/restaurants', {
          headers: {
            'Cache-Control': 'max-age=300',
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        
        if (data.success && Array.isArray(data.data.restaurants)) {
          setRestaurants(data.data.restaurants);
          
          // ✅ THÊM: Lưu vào sessionStorage
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(data.data.restaurants));
          sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
          console.log('✅ Cached restaurants data');
        } else {
          throw new Error('Invalid data structure');
        }
      } catch (err) {
        console.error('❌ Error fetching restaurants:', err);
        setError('Không thể tải danh sách nhà hàng. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // ✅ THÊM: Loading state
  if (loading) {
    return (
      <main className="w-full max-w-screen-2xl mx-auto py-24 lg:px-32 md:px-18 px-12">
        <h1 className="text-3xl font-bold mb-6">Danh sách nhà hàng</h1>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <span className="ml-4 text-gray-600">Đang tải...</span>
        </div>
      </main>
    );
  }

  // ✅ THÊM: Error state
  if (error) {
    return (
      <main className="w-full max-w-screen-2xl mx-auto py-24 lg:px-32 md:px-18 px-12">
        <h1 className="text-3xl font-bold mb-6">Danh sách nhà hàng</h1>
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => {
              sessionStorage.removeItem(CACHE_KEY);
              sessionStorage.removeItem(CACHE_TIME_KEY);
              window.location.reload();
            }} 
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full max-w-screen-2xl mx-auto py-24 lg:px-32 md:px-18 px-12">
      <h1 className="text-3xl font-bold">Danh sách nhà hàng</h1>
      
      {restaurants.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">Không có nhà hàng nào.</p>
        </div>
      ) : (
        <RestaurantList restaurants={restaurants} />
      )}
    </main>
  );
};

export default RestaurantClient;