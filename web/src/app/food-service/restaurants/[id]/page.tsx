'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

import { Restaurant, Food } from '../../interfaces';

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);

  // Helper function để format price an toàn
  const formatPrice = (price: string) => {
    const parsed = parseInt(price);
    return isNaN(parsed) ? '0' : parsed.toLocaleString();
  };

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:5001/api/restaurants/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRestaurant(data.data);
        }
      })
      .catch(err => console.error('Error fetching restaurant:', err));

    // Uncomment nếu muốn load foods
    fetch(`http://localhost:5001/api/restaurants/${id}/foods`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFoods(data.data);
        }
      })
      .catch(err => console.error('Error fetching foods:', err));
  }, [id]);

  if (!restaurant) return <p>Đang tải thông tin nhà hàng...</p>;

  return (
    <main className="w-full max-w-screen-2xl mx-auto py-24 lg:px-24 px-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 relative h-64 md:h-80">
          <Image
            // ảnh placeholder cho 'avatar' của nhà hàng, nếu ko có ảnh nhà hàng cho trước.
            src={restaurant.image_url || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTBkR4TrQ2yBGV92K1tLf85d2o0-wWuxSAMg&s'}
            alt={restaurant.restaurant_name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover rounded-xl"
          />
        </div>

        {/* card infos */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{restaurant.restaurant_name}</h1>
          
          <p className="text-gray-600">{restaurant.description}</p>
          
          <p className="mt-2 text-sm text-gray-500">📍 {restaurant.address}</p>
          
          <p className="text-sm text-gray-500">📞 {restaurant.phone}</p>

          <p className="text-yellow-600 mt-1">
            ⭐ {parseFloat(restaurant.rating).toFixed(1)} ({restaurant.total_reviews.toLocaleString()} đánh giá)
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Danh sách món ăn</h2>
      
      {foods.length === 0 ? (
        <p className="text-gray-500">Không có món ăn nào được tìm thấy.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {foods.map((food) => (
            <div key={food.food_id} className="border p-4 rounded-lg shadow-sm bg-white">
              <div className="relative w-full h-40 mb-3">
                <Image
                  src={food.image_url || ''}
                  alt={food.food_name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover rounded"
                />
              </div>
              <h3 className="text-lg font-semibold">{food.food_name}</h3>
              <p className="text-sm text-gray-600">{food.description || 'Không có mô tả'}</p>
              <p className="text-red-500 font-bold mt-1">
                {formatPrice(food.price)} đ
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}