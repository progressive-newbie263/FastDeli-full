'use client';

import React, { useEffect, useState } from 'react';
import { Food } from '../interfaces';
import Image from 'next/image';

import OrderDetailPopup from './OrderDetailPopup';

interface StoredCartItem {
  food_id: number;
  quantity: number;
}

interface FullCart {
  [restaurantId: string]: StoredCartItem[];
}

interface CartItem {
  restaurant_id: string;
  food_id: number;
  food_name: string;
  price: number;
  image_url: string | null;
  description?: string;
  quantity: number;
}

interface RestaurantGroup {
  restaurant_id: string;
  restaurant_name: string;
  restaurant_image?: string; // Thêm ảnh nhà hàng
  items: CartItem[];
}

const Page = () => {
  const [groupedCart, setGroupedCart] = useState<RestaurantGroup[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantGroup | null>(null);

  useEffect(() => {
    const userCart = localStorage.getItem('cart');
    if (!userCart) return;

    try {
      const parsedCart = JSON.parse(userCart) as FullCart;
      const restaurantIds = Object.keys(parsedCart);

      const fetchAllFoods = async () => {
        const groups: RestaurantGroup[] = [];

        for (const restaurantId of restaurantIds) {
          const [resFoods, resInfo] = await Promise.all([
            fetch(`http://localhost:5001/api/restaurants/${restaurantId}/foods`).then(res => res.json()),
            fetch(`http://localhost:5001/api/restaurants/${restaurantId}`).then(res => res.json())
          ]);

          if (!resFoods.success || !resInfo.success) continue;

          const foods: Food[] = resFoods.data;
          const restaurantName: string = resInfo.data.restaurant_name;
          const restaurantImage: string = resInfo.data.image_url || 'https://via.placeholder.com/80';
          const storedItems = parsedCart[restaurantId];
          const items: CartItem[] = [];

          storedItems.forEach(({ food_id, quantity }) => {
            const food = foods.find(f => f.food_id === food_id);
            if (food) {
              items.push({
                restaurant_id: restaurantId,
                food_id: food.food_id,
                food_name: food.food_name,
                price: parseFloat(food.price),
                image_url: food.image_url,
                description: food.description,
                quantity
              });
            }
          });

          if (items.length > 0) {
            groups.push({
              restaurant_id: restaurantId,
              restaurant_name: restaurantName,
              restaurant_image: restaurantImage,
              items
            });
          }
        }

        setGroupedCart(groups);
      };

      fetchAllFoods();
    } catch (err) {
      console.error('Lỗi xử lý cart:', err);
    }
  }, []);

  // Hàm tính tổng tiền cho 1 đơn từ 1 nhà hàng
  const getGroupTotal = (group: RestaurantGroup) => {
    return group.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
  };

  // Hàm tính tổng tiền toàn bộ giỏ hàng
  const getTotalCart = () => {
    return groupedCart.reduce((sum, group) => sum + getGroupTotal(group), 0);
  };

  const increase = (food_id: number, restaurant_id: string) => {
    setGroupedCart(prev => prev.map(group => {
      if (group.restaurant_id !== restaurant_id) return group;

      const updatedItems = group.items.map(item => item.food_id === food_id 
        ? { ...item, quantity: item.quantity + 1 } : item 
      );

      return { ...group, items: updatedItems };
    }));

    // Cập nhật selectedRestaurant nếu đang xem chi tiết
    if (selectedRestaurant && selectedRestaurant.restaurant_id === restaurant_id) {
      setSelectedRestaurant(prev => ({
        ...prev!,
        items: prev!.items.map(item => item.food_id === food_id 
          ? { ...item, quantity: item.quantity + 1 } : item 
        )
      }));
    }
  };

  const decrease = (food_id: number, restaurant_id: string) => {
    setGroupedCart(prev => prev.map(group => {
      if (group.restaurant_id !== restaurant_id) return group;

      const updatedItems = group.items.map(item => item.food_id === food_id
        ? { ...item, quantity: item.quantity - 1 } : item
      ).filter(item => item.quantity > 0); 

      return { ...group, items: updatedItems };
    }).filter(group => group.items.length > 0));

    // Cập nhật selectedRestaurant nếu đang xem chi tiết
    if (selectedRestaurant && selectedRestaurant.restaurant_id === restaurant_id) {
      const updatedItems = selectedRestaurant.items.map(item => item.food_id === food_id
        ? { ...item, quantity: item.quantity - 1 } : item
      ).filter(item => item.quantity > 0);

      if (updatedItems.length === 0) {
        setSelectedRestaurant(null); // Đóng popup nếu không còn món nào
      } else {
        setSelectedRestaurant({
          ...selectedRestaurant,
          items: updatedItems
        });
      }
    }
  };

  const handleCheckout = (restaurant_id: string) => {
    const restaurant = groupedCart.find(
      g => g.restaurant_id === restaurant_id
    );
    if (!restaurant) return;

    console.log('Đặt đơn hàng cho:', restaurant.restaurant_name);
    console.log('Chi tiết đơn hàng:', restaurant.items);

    // Xóa đơn hàng của nhà hàng vừa thanh toán khỏi giao diện
    const newGroupedCart = groupedCart.filter(
      g => g.restaurant_id !== restaurant_id
    );
    setGroupedCart(newGroupedCart);

    // Đóng popup hóa đơn nếu đang xem nhà hàng vừa thanh toán
    if (selectedRestaurant && selectedRestaurant.restaurant_id === restaurant_id) {
      setSelectedRestaurant(null);
    }

    // Cập nhật lại localStorage
    const updatedCart: FullCart = {};
    newGroupedCart.forEach(group => {
      updatedCart[group.restaurant_id] = group.items.map(({ food_id, quantity }) => ({
        food_id,
        quantity
      }));
    });
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  return (
    <main className="w-full max-w-screen-2xl mx-auto py-24 lg:px-32 md:px-18 px-12">
      <h1 className="text-3xl font-bold mb-8">🛒 Món ăn đã chọn</h1>

      {groupedCart.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-gray-500 text-lg">Giỏ hàng của bạn đang trống.</p>
          <p className="text-gray-400 text-sm mt-2">Hãy chọn một số món ăn ngon để bắt đầu!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedCart.map(group => (
            <div 
              key={group.restaurant_id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={group.restaurant_image || 'https://via.placeholder.com/80'}
                    alt={group.restaurant_name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />

                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      🍽️ {group.restaurant_name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm">
                      {group.items.length} món • {getGroupTotal(group).toLocaleString()} đ
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedRestaurant(group)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  Xem đơn hàng
                  <span className="text-sm">→</span>
                </button>
              </div>
            </div>
          ))}

          {/* Tổng cộng toàn bộ giỏ hàng */}
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
            <p className="text-xl font-bold text-gray-800 mb-2">
              Tổng cộng toàn bộ: {getTotalCart().toLocaleString()} đ
            </p>
            <p className="text-gray-600 text-sm">
              Bạn có {groupedCart.length} đơn hàng từ {groupedCart.length} nhà hàng
            </p>
          </div>
        </div>
      )}

      {/* chi tiết đơn hàng */}
      {selectedRestaurant && (
        <OrderDetailPopup
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
          onIncrease={increase}
          onDecrease={decrease}
          onCheckout={handleCheckout}
          getGroupTotal={getGroupTotal}
        />
      )}
    </main>
  );
};

export default Page;