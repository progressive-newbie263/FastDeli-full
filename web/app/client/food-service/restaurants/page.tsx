'use client'

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Filter, MapPin, Search, SlidersHorizontal, Star, Truck } from 'lucide-react';
import RestaurantList from './Restaurants';
import { Restaurant } from '../interfaces';

type Category = {
  category_id: number;
  category_name: string;
};

type BannerItem = {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  href: string;
};

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

const PROMO_BANNERS: BannerItem[] = [
  {
    id: 1,
    title: 'Giảm 30% cho đơn hàng đầu tiên',
    subtitle: 'Nhận ưu đãi cho nhà hàng bạn yêu thích ngày hôm nay.',
    image: '/assets/food-images/intro-1.png',
    href: '/client/food-service/restaurants?sort=popular',
  },
  {
    id: 2,
    title: 'Freeship tới 20K',
    subtitle: 'Đặt món tiết kiệm hơn với các quán có phí giao hàng 0đ.',
    image: '/assets/food-images/intro-2.png',
    href: '/client/food-service/restaurants?freeship=1',
  },
  {
    id: 3,
    title: 'Quán mới đang lên sàn',
    subtitle: 'Khám phá nhà hàng mới, review thật và menu đang hot.',
    image: '/assets/food-images/shared-food-image.jpg',
    href: '/client/food-service/restaurants',
  },
];

const RestaurantClient = () => {
  const searchParams = useSearchParams();
  const searchKeyword = (searchParams.get('search') || '').trim();
  const forceNearby = searchParams.get('nearby') === '1';
  const selectedCategory = Number(searchParams.get('category') || 0);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNearbyMode, setIsNearbyMode] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const [localSearch, setLocalSearch] = useState(searchKeyword);
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'reviews' | 'deliveryFee'>('default');
  const [onlyFreeShip, setOnlyFreeShip] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [onlyFeatured, setOnlyFeatured] = useState(false);

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
      const canUseCache = searchKeyword.length === 0 && selectedCategory === 0 && !forceNearby;

      if (canUseCache && cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        if (age < CACHE_DURATION) {
          const cachedData = JSON.parse(cached) as Restaurant[];
          const userCoords = await resolveUserCoordinates();
          if (userCoords) {
            setRestaurants(withDistance(cachedData, userCoords.latitude, userCoords.longitude));
            setIsNearbyMode(false);
          } else {
            setRestaurants(cachedData);
          }
          setLoading(false);
          return;
        }
      }

      const userCoords = await resolveUserCoordinates();

      if (searchKeyword.length > 0 || selectedCategory > 0) {
        const query = new URLSearchParams();
        if (searchKeyword.length > 0) {
          query.set('search', searchKeyword);
        }
        if (selectedCategory > 0) {
          query.set('category_id', String(selectedCategory));
        }

        const searchRes = await fetch(
          `http://localhost:5001/api/restaurants?${query.toString()}`,
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

      if (userCoords && forceNearby) {
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
          setIsNearbyMode(false);
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

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/categories');
      const data = await response.json();
      if (data?.success && Array.isArray(data?.data)) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Không thể tải category:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchRestaurants();
  }, [searchKeyword, forceNearby, selectedCategory]);

  useEffect(() => {
    setLocalSearch(searchKeyword);
  }, [searchKeyword]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleLocationUpdated = () => {
      sessionStorage.removeItem(CACHE_KEY);
      sessionStorage.removeItem(CACHE_TIME_KEY);
      fetchRestaurants();
    };

    window.addEventListener('user-location-updated', handleLocationUpdated);
    return () => window.removeEventListener('user-location-updated', handleLocationUpdated);
  }, []);

  const filteredRestaurants = useMemo(() => {
    const keyword = localSearch.trim().toLowerCase();

    let next = restaurants.filter((restaurant) => {
      const matchedKeyword =
        keyword.length === 0 ||
        restaurant.name.toLowerCase().includes(keyword) ||
        restaurant.address.toLowerCase().includes(keyword);

      const deliveryFee = parseNumber(restaurant.delivery_fee) ?? 0;
      const matchedFreeShip = !onlyFreeShip || deliveryFee <= 0;

      const rating = parseNumber(restaurant.rating) ?? 0;
      const matchedRating = minRating <= 0 || rating >= minRating;

      const matchedFeatured = !onlyFeatured || restaurant.is_featured;

      return matchedKeyword && matchedFreeShip && matchedRating && matchedFeatured;
    });

    if (sortBy === 'default') {
      next = [...next].sort((a, b) => {
        const aDistance = parseNumber(a.distance_km) ?? Number.MAX_SAFE_INTEGER;
        const bDistance = parseNumber(b.distance_km) ?? Number.MAX_SAFE_INTEGER;
        return aDistance - bDistance;
      });
    }

    if (sortBy === 'rating') {
      next = [...next].sort((a, b) => {
        const aRating = parseNumber(a.rating) ?? 0;
        const bRating = parseNumber(b.rating) ?? 0;
        return bRating - aRating;
      });
    }

    if (sortBy === 'reviews') {
      next = [...next].sort((a, b) => b.total_reviews - a.total_reviews);
    }

    if (sortBy === 'deliveryFee') {
      next = [...next].sort((a, b) => {
        const aFee = parseNumber(a.delivery_fee) ?? Number.MAX_SAFE_INTEGER;
        const bFee = parseNumber(b.delivery_fee) ?? Number.MAX_SAFE_INTEGER;
        return aFee - bFee;
      });
    }

    return next;
  }, [restaurants, localSearch, onlyFreeShip, minRating, onlyFeatured, sortBy]);

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
    <main className="w-full max-w-screen-2xl mx-auto py-16 lg:px-32 md:px-18 px-12">
      <section className="mt-4 relative rounded-3xl overflow-hidden border border-green-100 bg-green-50">
        <div className="relative h-44 sm:h-52 md:h-56">
          {PROMO_BANNERS.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                activeBanner === index ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 1200px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-transparent" />
              <div className="absolute left-4 top-4 sm:left-8 sm:top-8 max-w-[75%] text-white">
                <p className="text-xl sm:text-3xl font-semibold leading-tight">{banner.title}</p>
                <p className="text-xs sm:text-sm mt-2 text-white/90">{banner.subtitle}</p>
                <Link
                  href={banner.href}
                  className="inline-flex mt-4 items-center gap-2 rounded-full bg-white text-green-700 px-4 py-1.5 text-sm font-medium hover:bg-green-50 transition"
                >
                  Xem ưu đãi
                </Link>
              </div>
            </div>
          ))}

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {PROMO_BANNERS.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => setActiveBanner(index)}
                aria-label={`Chuyen den banner ${index + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  activeBanner === index ? 'w-6 bg-white' : 'w-2.5 bg-white/65 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <div className="mt-4 flex gap-2 flex-wrap">
          <Link
            href="/client/food-service/restaurants"
            scroll={false}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              selectedCategory <= 0
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
            }`}
          >
            Tất cả
          </Link>

          {categories.map((category) => (
            <Link
              key={category.category_id}
              href={`/client/food-service/restaurants?category=${category.category_id}`}
              scroll={false}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                selectedCategory === category.category_id
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
              }`}
            >
              {category.category_name}
            </Link>
          ))}
        </div>
      )}

      <section className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setOnlyFeatured((prev) => !prev)}
            className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm transition ${
              onlyFeatured
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
            }`}
          >
            <Filter className="w-4 h-4" />
            Nổi bật
          </button>

          <button
            type="button"
            onClick={() => setOnlyFreeShip((prev) => !prev)}
            className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm transition ${
              onlyFreeShip
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
            }`}
          >
            <Truck className="w-4 h-4" />
            Free ship
          </button>

          <button
            type="button"
            onClick={() => setMinRating((prev) => (prev >= 4.5 ? 0 : 4.5))}
            className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm transition ${
              minRating >= 4.5
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
            }`}
          >
            4.5
            <Star className="w-4 h-4" />
            +
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          <label className="flex-1 h-12 rounded-2xl border border-gray-300 bg-white flex items-center px-4 gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              value={localSearch}
              onChange={(event) => setLocalSearch(event.target.value)}
              placeholder="Tìm nhà hàng, món ăn..."
              className="w-full outline-none text-sm text-gray-700 placeholder:text-gray-400"
            />
          </label>

          <div className="h-12 rounded-2xl border border-gray-300 bg-white px-3 flex items-center gap-2 min-w-[170px]">
            <MapPin className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as 'default' | 'rating' | 'reviews' | 'deliveryFee')}
              className="w-full bg-transparent outline-none text-sm text-gray-700"
            >
              <option value="default">Gan nhat</option>
              <option value="rating">Danh gia cao</option>
              <option value="reviews">Nhieu danh gia</option>
              <option value="deliveryFee">Phi giao thap</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setOnlyFeatured(false);
              setOnlyFreeShip(false);
              setMinRating(0);
              setSortBy('default');
              setLocalSearch(searchKeyword);
            }}
            className="h-12 rounded-2xl border border-gray-300 bg-white px-4 inline-flex items-center 
              gap-2 text-sm text-gray-700 hover:border-green-400 transition
            "
          >
            <SlidersHorizontal className="w-4 h-4" />
            Đặt lại
          </button>
        </div>
      </section>

      <h1 className="text-3xl font-bold mt-10">
        Danh sách nhà hàng ({filteredRestaurants.length})
      </h1>

      {isNearbyMode && (
        <p className="text-sm text-blue-700 mt-2">
          Hệ thống đang ưu tiên gợi ý các nhà hàng gần vị trí hiện tại của bạn.
        </p>
      )}
      
      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">Không có nhà hàng nào.</p>
        </div>
      ) : (
        <RestaurantList restaurants={filteredRestaurants} />
      )}
    </main>
  );
};

export default RestaurantClient;