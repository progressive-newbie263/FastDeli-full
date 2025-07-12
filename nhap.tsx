'use client';

import React, { useEffect, useState } from 'react';
import { Food } from '../interfaces';

// dùng độc lập cho 'cart' nên k cần để chung sang 'interfaces/index.ts'
interface CartItem {
  food_id: number;
  food_name: string;
  price: number;
  quantity: number;
}

const Page = () => {
  const [menuFoods, setMenuFoods] = useState<Food[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 👉 Set id nhà hàng cần fetch (có thể lấy từ route sau)
  const restaurantId = 1;

  // 🧠 Fetch món ăn từ server
  useEffect(() => {
    fetch(`http://localhost:5001/api/restaurants/${restaurantId}/foods`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setMenuFoods(data.data);
      })
      .catch(err => console.error('Lỗi lấy danh sách món ăn:', err));
  }, []);

  // 🧠 Map cartQuantities + menuFoods thành cartItems
  useEffect(() => {
    const raw = localStorage.getItem('cartQuantities');
    if (!raw) return;

    const parsed = JSON.parse(raw) as { [foodId: number]: number };

    const merged: CartItem[] = Object.entries(parsed).map(([id, qty]) => {
      const food = menuFoods.find(f => f.food_id === parseInt(id));
      return {
        food_id: food?.food_id ?? parseInt(id),
        food_name: food?.food_name ?? `Món #${id}`,
        price: food?.price ?? 0,
        quantity: qty
      };
    });

    setCartItems(merged);
  }, [menuFoods]);

  useEffect(() => {
    if (menuFoods.length === 0) return; // Đợi fetch xong đã

    const dataToSave: { [foodId: number]: number } = {};
    cartItems.forEach(item => {
      if (item.quantity > 0) {
        dataToSave[item.food_id] = item.quantity;
      }
    });

    localStorage.setItem('cartQuantities', JSON.stringify(dataToSave));
    window.dispatchEvent(new Event('storage'));
  }, [cartItems, menuFoods]);

  const increase = (id: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.food_id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrease = (id: number) => {
    setCartItems(prev =>
      prev
        .map(item =>
          item.food_id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const total = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <main className="w-full max-w-screen-2xl mx-auto py-24 lg:px-32 md:px-18 px-12">
      <h1 className="text-3xl font-bold mb-8">🛒 Món ăn đã chọn</h1>

      {cartItems.length === 0 ? (
        <p className="text-gray-500">Giỏ hàng của bạn đang trống.</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map(item => (
            <div key={item.food_id} className="flex justify-between items-center border-b py-3">
              <div>
                <p className="font-semibold text-lg">{item.food_name}</p>
                <p className="text-sm text-gray-500">{item.price.toLocaleString()} đ</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => decrease(item.food_id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  -
                </button>
                <span className="font-semibold">{item.quantity}</span>
                <button
                  onClick={() => increase(item.food_id)}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  +
                </button>
              </div>
            </div>
          ))}

          <div className="text-right mt-8">
            <p className="text-xl font-bold">
              Tổng cộng: {total.toLocaleString()} đ
            </p>
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;
