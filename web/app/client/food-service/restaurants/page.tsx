'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import RestaurantList from './Restaurants';
import { Restaurant } from '../interfaces';

// Constants cho cache
const CACHE_KEY = 'restaurants_cache';
const CACHE_TIME_KEY = 'restaurants_cache_time';
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

type UserLocation = {
  latitude?: number;
  longitude?: number;
  address?: string;
  timestamp?: number;
};

const parseNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const geocodeAddressToCoordinates = async (address: string) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&accept-language=vi`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'FoodDeli/1.0',
    },
  });

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  if (!Array.isArray(result) || result.length === 0) {
    return null;
  }

  const latitude = parseNumber(result[0]?.lat);
  const longitude = parseNumber(result[0]?.lon);
  if (latitude === null || longitude === null) {
    return null;
  }

  return { latitude, longitude };
};

const withDistance = (restaurants: Restaurant[], userLat: number, userLng: number): Restaurant[] => {
  return restaurants
    .map((restaurant) => {
      const lat = parseNumber(restaurant.latitude);
      const lng = parseNumber(restaurant.longitude);

      if (lat === null || lng === null) {
        return { ...restaurant, distance_km: null };
      }

      const euclidean = Math.sqrt((lat - userLat) ** 2 + (lng - userLng) ** 2);
      const distanceKm = euclidean * 111;

      return {
        ...restaurant,
        distance_km: distanceKm,
      };
    })
    .sort((a, b) => {
      const aDistance = typeof a.distance_km === 'number' ? a.distance_km : Number.MAX_SAFE_INTEGER;
      const bDistance = typeof b.distance_km === 'number' ? b.distance_km : Number.MAX_SAFE_INTEGER;
      return aDistance - bDistance;
    });
};

const RestaurantClient = () => {
  const searchParams = useSearchParams();
  const searchKeyword = (searchParams.get('search') || '').trim();
  const forceNearby = searchParams.get('nearby') === '1';

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNearbyMode, setIsNearbyMode] = useState(false);

  const resolveUserCoordinates = async (): Promise<{ latitude: number; longitude: number } | null> => {
    const raw = localStorage.getItem('userLocation');
    if (!raw) {
      return null;
    }

    try {
      const location = JSON.parse(raw) as UserLocation;
      const latitude = parseNumber(location.latitude);
      const longitude = parseNumber(location.longitude);

      if (latitude !== null && longitude !== null) {
        return { latitude, longitude };
      }

      if (location.address) {
        const geocoded = await geocodeAddressToCoordinates(location.address);
        if (geocoded) {
          localStorage.setItem('userLocation', JSON.stringify({
            ...location,
            latitude: geocoded.latitude,
            longitude: geocoded.longitude,
            timestamp: Date.now(),
          }));
          return geocoded;
        }
      }
    } catch (parseError) {
      console.error('Invalid userLocation value:', parseError);
    }

    return null;
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsNearbyMode(false);
      
      const cached = sessionStorage.getItem(CACHE_KEY);
      const cacheTime = sessionStorage.getItem(CACHE_TIME_KEY);
      const canUseCache = searchKeyword.length === 0 && !forceNearby;

      if (canUseCache && cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        if (age < CACHE_DURATION) {
          const cachedData = JSON.parse(cached) as Restaurant[];
          const userCoords = await resolveUserCoordinates();
          if (userCoords) {
            setRestaurants(withDistance(cachedData, userCoords.latitude, userCoords.longitude));
            setIsNearbyMode(true);
          } else {
            setRestaurants(cachedData);
          }
          setLoading(false);
          return;
        }
      }

      const userCoords = await resolveUserCoordinates();

      if (searchKeyword.length > 0) {
        const searchRes = await fetch(
          `http://localhost:5001/api/restaurants?search=${encodeURIComponent(searchKeyword)}`,
          {
            headers: {
              'Cache-Control': 'max-age=60',
            },
          }
        );

        if (!searchRes.ok) {
          throw new Error(`HTTP error! status: ${searchRes.status}`);
        }

        const searchData = await searchRes.json();
        if (searchData.success && Array.isArray(searchData.data?.restaurants)) {
          if (userCoords) {
            setRestaurants(withDistance(searchData.data.restaurants, userCoords.latitude, userCoords.longitude));
          } else {
            setRestaurants(searchData.data.restaurants);
          }
          setIsNearbyMode(false);
          setLoading(false);
          return;
        }
      }

      if (userCoords && (forceNearby || searchKeyword.length === 0)) {
        const nearbyRes = await fetch(
          `http://localhost:5001/api/restaurants/nearby?latitude=${userCoords.latitude}&longitude=${userCoords.longitude}&limit=50`,
          {
            headers: {
              'Cache-Control': 'max-age=300',
            },
          }
        );

        if (nearbyRes.ok) {
          const nearbyData = await nearbyRes.json();
          if (nearbyData.success && Array.isArray(nearbyData.data?.restaurants)) {
            const normalized = withDistance(nearbyData.data.restaurants, userCoords.latitude, userCoords.longitude);
            setRestaurants(normalized);
            setIsNearbyMode(true);
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(nearbyData.data.restaurants));
            sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
            setLoading(false);
            return;
          }
        }
      }
      
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
        const userCoordsFallback = await resolveUserCoordinates();
        if (userCoordsFallback) {
          setRestaurants(withDistance(data.data.restaurants, userCoordsFallback.latitude, userCoordsFallback.longitude));
          setIsNearbyMode(true);
        } else {
          setRestaurants(data.data.restaurants);
        }
        
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(data.data.restaurants));
        sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      } else {
        throw new Error('Invalid data structure');
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError('Không thể tải danh sách nhà hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [searchKeyword, forceNearby]);

  useEffect(() => {
    const handleLocationUpdated = () => {
      sessionStorage.removeItem(CACHE_KEY);
      sessionStorage.removeItem(CACHE_TIME_KEY);
      fetchRestaurants();
    };

    window.addEventListener('user-location-updated', handleLocationUpdated);
    return () => window.removeEventListener('user-location-updated', handleLocationUpdated);
  }, []);

  // Loading state
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

  // Error state
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
      {isNearbyMode && (
        <p className="text-sm text-blue-700 mt-2">
          Hệ thống đang ưu tiên gợi ý các nhà hàng gần vị trí hiện tại của bạn.
        </p>
      )}
      
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