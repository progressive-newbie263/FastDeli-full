'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Restaurant, Food } from '../../interfaces';
import { FaCirclePlus } from "react-icons/fa6";
import { useAuth } from '@food/context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Type cho cart structure
interface CartItem {
  food_id: number;
  quantity: number;
}

interface Cart {
  [restaurant_id: string]: CartItem[];
}

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [quantities, setQuantities] = useState<{ [foodId: number]: number }>({});
  const { isAuthenticated } = useAuth();

  const formatPrice = (price: string) => {
    const parsed = parseInt(price);
    return isNaN(parsed) ? '0' : parsed.toLocaleString();
  };

  // useEffect này dò đường dẫn và trả về ds nhà hàng hoặc ds món ăn của nhà hàng.
  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:5001/api/restaurants/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setRestaurant(data.data);
      })
      .catch(err => console.error('Error fetching restaurant:', err));

    fetch(`http://localhost:5001/api/restaurants/${id}/foods`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setFoods(data.data);
      })
      .catch(err => console.error('Error fetching foods:', err));
  }, [id]);

  // Load cart data từ localStorage khi component mount
  useEffect(() => {
    if (!id) return;

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart) as Cart;
        const restaurantId = id.toString();
        
        // Lấy dữ liệu cart của restaurant hiện tại
        if (parsedCart[restaurantId]) {
          const restaurantCart = parsedCart[restaurantId];
          const quantityMap: { [foodId: number]: number } = {};
          
          restaurantCart.forEach(item => {
            quantityMap[item.food_id] = item.quantity;
          });
          
          setQuantities(quantityMap);
        }
      } catch (error) {
        console.error("Lỗi khi parse cart:", error);
      }
    }
  }, [id]);

  // Hàm cập nhật localStorage với structure mới
  const updateCartInLocalStorage = (newQuantities: { [foodId: number]: number }) => {
    if (!id) return;

    const restaurantId = id.toString();
    const savedCart = localStorage.getItem('cart');
    let cart: Cart = {};
    
    if (savedCart) {
      try {
        cart = JSON.parse(savedCart) as Cart;
      } catch (error) {
        console.error("Lỗi khi parse cart:", error);
        cart = {};
      }
    }

    // Tạo array CartItem từ quantities
    const cartItems: CartItem[] = Object.entries(newQuantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([foodId, quantity]) => ({
        food_id: parseInt(foodId),
        quantity: quantity
      }));

    // Cập nhật cart cho restaurant hiện tại
    if (cartItems.length > 0) {
      cart[restaurantId] = cartItems;
    } else {
      // Nếu không có món nào, xóa restaurant khỏi cart
      delete cart[restaurantId];
    }

    // Lưu vào localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Dispatch event để cập nhật các component khác
    window.dispatchEvent(new Event('storage'));
  };

  // Cập nhật localStorage mỗi khi quantities thay đổi
  useEffect(() => {
    updateCartInLocalStorage(quantities);
  }, [quantities, id]);

  const handleAddToCart = (foodId: number) => {
    // chưa đăng nhập sẽ hiện thông báo lỗi (1 cái toast/pop-up)
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm món vào giỏ hàng.', {
        position: 'top-center',
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
      });
      return;
    }

    setQuantities((prev) => ({
      ...prev,
      [foodId]: 1,
    }));
  };

  const increaseQuantity = (foodId: number) => {
    setQuantities((prev) => ({
      ...prev,
      [foodId]: (prev[foodId] || 0) + 1,
    }));
  };

  const decreaseQuantity = (foodId: number) => {
    setQuantities((prev) => {
      const current = prev[foodId] || 0;
      if (current <= 1) {
        const updated = { ...prev };
        delete updated[foodId];
        return updated;
      }
      return {
        ...prev,
        [foodId]: current - 1,
      };
    });
  };

  if (!restaurant) return <p>Đang tải thông tin nhà hàng...</p>;

  return (
    <main className="w-full max-w-screen-2xl mx-auto py-24 lg:px-32 px-10">
      <ToastContainer />
      
      <div className="flex flex-col text-center items-center gap-8 md:flex-row md:text-left md:items-start">
        <div className="relative w-[250px] h-[200px]">
          <Image
            src={restaurant.image_url || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTBkR4TrQ2yBGV92K1tLf85d2o0-wWuxSAMg&s'}
            alt={restaurant.restaurant_name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover rounded-xl"
          />
        </div>

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
              <div className="flex flex-row px-4 pt-4 pb-10 rounded-lg shadow-sm bg-white hover:border hover:border-green-400 relative">
                <div className="relative w-[120px] h-[120px] mr-4">
                  <Image
                    src={food.image_url || ''}
                    alt={food.food_name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover rounded"
                  />
                </div>

                <div className="flex flex-col justify-between">
                  <h3 className="text-lg font-semibold">{food.food_name}</h3>
                  <p className="text-sm text-gray-600">{food.description || 'Không có mô tả'}</p>
                  <p className="text-red-500 font-bold mt-1">
                    {formatPrice(food.price)} đ
                  </p>
                </div>

                {/* 
                  sẽ alternate giữa 2 cái sau: nếu như ở trạng thái ban đầu sẽ là 1 icon dấu cộng (thêm vào giỏ)
                  - Nếu đã có món trong giỏ hàng thì sẽ hiển thị số lượng và 2 nút tăng giảm
                  - Số lượng về 0 thì reset lại thành cái icon + ban đầu.
                */}
                <div className="absolute bottom-2 right-2 z-10">
                  {quantities[food.food_id] ? (
                    <div className="flex items-center space-x-2 mb-2">
                      <button onClick={() => decreaseQuantity(food.food_id)} className="bg-red-500 text-white px-2 rounded cursor-pointer">
                        -
                      </button>
                      
                      <span>{quantities[food.food_id]}</span>
                      
                      <button onClick={() => increaseQuantity(food.food_id)} className="bg-green-500 text-white px-2 rounded cursor-pointer">
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(food.food_id)}
                      className="text-green-600 cursor-pointer"
                    >
                      <FaCirclePlus size={28} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}