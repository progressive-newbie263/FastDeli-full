'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Restaurant, Food } from '../../interfaces';
import { FaCirclePlus } from "react-icons/fa6";
import Link from 'next/link';


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
    <main className="w-full max-w-screen-2xl mx-auto py-24 lg:px-32 px-10">
      <div className="flex flex-col text-center items-center gap-8 
        md:flex-row md:text-left md:items-start
      ">
        <div className="relative w-[250px] h-[200px]">
          <Image
            src={restaurant.image_url || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTBkR4TrQ2yBGV92K1tLf85d2o0-wWuxSAMg&s'}
            alt={restaurant.restaurant_name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover rounded-xl"
          />
        </div>

        {/* 
          thông tin nhà hàng
          *** note: fix cứng h-[200px] có vẻ là cách hay nhất rồi. h-full ko được do ko ép h thẻ cha.
        */}
        <div className="flex flex-col justify-between h-[200px]">
          <h1 className="text-3xl font-bold">{restaurant.restaurant_name}</h1>
          
          <p className="text-gray-600">{restaurant.description}</p>
          
          <p className="mt-2 text-sm text-gray-500">📍 {restaurant.address}</p>
          
          <p className="text-sm text-gray-500">📞 {restaurant.phone}</p>

          <p className="text-yellow-600 mt-1">
            ⭐ {parseFloat(restaurant.rating).toFixed(1)} ({restaurant.total_reviews.toLocaleString()} đánh giá)
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-24 mb-8">Danh sách món ăn</h2>
      
      {foods.length === 0 ? (
        <p className="text-gray-500">Không có món ăn nào được tìm thấy.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {foods.map((food) => (
            <div key={food.food_id} className="relative">
              <div className="flex flex-row px-4 pt-4 pb-10 rounded-lg shadow-sm bg-white
                hover:border hover:border-green-400 hover:cursor-pointer 
                relative
              ">
                <div className="relative w-[120px] h-[120px] mr-4">
                  <Image
                    src={food.image_url || ''}
                    alt={food.food_name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover rounded"
                  />
                </div>

                {/* card infos */}
                <div className='flex flex-col justify-between'>
                  <h3 className="text-lg font-semibold">{food.food_name}</h3>
                  <p className="text-sm text-gray-600">{food.description || 'Không có mô tả'}</p>
                  <p className="text-red-500 font-bold mt-1">
                    {formatPrice(food.price)} đ
                  </p>
                </div>

                {/* icon nằm trong khối relative */}
                <div className="absolute bottom-2 right-2 z-10">
                  <Link href="#" className="rounded-full flex items-center justify-center transition">
                    <FaCirclePlus size={28} className="text-green-600" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}