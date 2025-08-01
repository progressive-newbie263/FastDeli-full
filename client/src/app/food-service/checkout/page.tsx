"use client";

import React, { useState, useEffect } from 'react';
import { 
  FaMapMarkerAlt, 
  FaClock, 
  FaCreditCard, 
  FaWallet, 
  FaPhone, 
  FaUser, 
  FaEdit,
  FaChevronLeft,
  FaShoppingBag,
  FaUtensils
} from 'react-icons/fa';

// Import types từ cartHandler
import { RestaurantGroup, CartItem, FullCart } from '../utils/cartHandler';
import { Food } from '../interfaces';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

// dùng lại UserData interface có bên profile-page.
interface UserData {
  full_name?: string;
  phone_number?: string;
  //address?: string;
  note?: string;
}

interface UserLocation {
  location?: string;
}

const CheckoutPage = () => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [userInfos, setUserInfos] = useState({
    name: '',
    phone: '',
    //address: '',
    note: ''
  });
  const [userLocation, setUserLocation] = useState({
    location: ''
  });

  // State để lưu dữ liệu từ localStorage
  const [cartData, setCartData] = useState<RestaurantGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy restaurant_id từ query params.
  const searchParams = useSearchParams();
  const selectedRestaurantId = searchParams.get('restaurantId'); //lấy giá trị restaurantId từ URL.
  const router = useRouter();

  console.log(localStorage.getItem('userLocation'));

  // Load dữ liệu từ localStorage khi component mount
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (!savedCart) {
          setIsLoading(false);
          return;
        }

        const parsedCart: FullCart = JSON.parse(savedCart);
        const restaurantIds = Object.keys(parsedCart);
        const groups: RestaurantGroup[] = [];

        for (const restaurantId of restaurantIds) {
          const [resFoods, resInfo] = await Promise.all([
            fetch(`http://localhost:5001/api/restaurants/${restaurantId}/foods`).then(res => res.json()),
            fetch(`http://localhost:5001/api/restaurants/${restaurantId}`).then(res => res.json())
          ]);

          if (!resFoods.success || !resInfo.success) continue;

          const foods: Food[] = resFoods.data;
          const restaurantName = resInfo.data.restaurant_name;
          const restaurantImage = resInfo.data.image_url || 'https://via.placeholder.com/64';
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

        //lọc nhóm đơn hàng.
        const filteredGroups = selectedRestaurantId ? groups.filter(group => group.restaurant_id === selectedRestaurantId) : groups;
        
        if (selectedRestaurantId && filteredGroups.length === 0) {
          toast.error('Không tìm thấy đơn hàng. Quý khách vui lòng thử lại sau.');
          router.push('/food-service/cart'); 
          
          return;
        }

        setCartData(filteredGroups);
      } catch (error) {
        console.error('Error loading cart data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartData();
  }, []);

  
  // useEffect số 2: xử lí lấy địa chỉ giao hàng + thông tin người dùng từ localStorage.
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');

    if (storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);

        // hỗ trợ cấu trúc userData có thể nằm trong key `user`
        const user = parsed.user ?? parsed;

        setUserInfos({
          name: user.full_name || '',
          phone: user.phone_number || '',
          //address: user.address || '',
          note: user.note || '',
        });
      } catch (err) {
        console.error('Lỗi khi parse userData từ localStorage:', err);
      }
    }
  }, []);

  // useEffect số 3: lấy địa chỉ giao hàng từ localStorage. (OpenStreetMap)
  useEffect(() => {
    const storedLocation = localStorage.getItem('userLocation');

    if (storedLocation) {
      try {
        const parsedLocation = JSON.parse(storedLocation);

        setUserLocation({
          location: parsedLocation.address
        });
      } catch (error) {
        console.error('Error parsing user location:', error);
      }
    }
  }, []);


  // Tính toán tổng tiền của tất cả nhà hàng
  const calculateGrandTotal = () => {
    if (!Array.isArray(cartData) || cartData.length === 0) return 0;
    
    return cartData.reduce((total, restaurant) => {
      if (!restaurant.items || !Array.isArray(restaurant.items)) return total;
      
      const restaurantTotal = restaurant.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
      return total + restaurantTotal;
    }, 0);
  };

  // Đếm tổng số món
  const getTotalItems = () => {
    if (!Array.isArray(cartData) || cartData.length === 0) return 0;
    
    return cartData.reduce((total, restaurant) => {
      if (!restaurant.items || !Array.isArray(restaurant.items)) return total;
      return total + restaurant.items.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);
  };

  // Tính phí
  const subtotal = calculateGrandTotal();
  const deliveryFee = 20000; // Phí giao hàng cố định
  const serviceFee = Math.round(subtotal * 0.05); // 5% phí dịch vụ
  const totalAmount = subtotal + deliveryFee + serviceFee;

  // xử lý đặt hàng cho 1 đơn hàng xác định. Phần else chưa cần thiết, sẽ làm sau.
  const handlePlaceOrder = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (!savedCart) {
        toast.error('Không tìm thấy giỏ hàng');
        return;
      }

      const parsedCart: FullCart = JSON.parse(savedCart);
      
      if (selectedRestaurantId) {
        delete parsedCart[selectedRestaurantId];

        localStorage.setItem('cart', JSON.stringify(parsedCart));
        // Dispatch event ngay để Header cập nhật số lượng cart
        window.dispatchEvent(new Event('cart-updated'));
        toast.success(`Đặt hàng thành công! Cảm ơn bạn đã sử dụng dịch vụ.`);
        
        setCartData(prevData => 
          prevData.filter(restaurant => restaurant.restaurant_id !== selectedRestaurantId)
        );

        router.push('/food-service/cart');
      } else {
        cartData.forEach(restaurant => {
          delete parsedCart[restaurant.restaurant_id];
        });

        localStorage.setItem('cart', JSON.stringify(parsedCart));
        window.dispatchEvent(new Event('cart-updated'));
        toast.success(`Đặt hàng thành công cho ${cartData.length} nhà hàng! Cảm ơn bạn đã sử dụng dịch vụ.`);

        setCartData([]);
        router.push('/food-service/cart');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!Array.isArray(cartData) || cartData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-500 mb-6">Vui lòng thêm món ăn vào giỏ hàng trước khi thanh toán</p>

          <button
            onClick={() => window.history.back()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Quay lại mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <FaChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Thanh toán</h1>
          </div>
        </div>
      </div>

      <div className="max-w-[968px] mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cột trái - Thông tin chính */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Thông tin các nhà hàng */}
            {Array.isArray(cartData) && cartData.map((restaurant) => (
              <div key={restaurant.restaurant_id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={restaurant.restaurant_image || 'https://via.placeholder.com/64'}
                    alt={restaurant.restaurant_name}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-green-100"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FaUtensils className="w-4 h-4 text-green-600" />
                      <h2 className="text-lg font-bold text-gray-800">
                        {restaurant.restaurant_name}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600">
                      {restaurant.items.length} món ăn • {restaurant.items.reduce((sum, item) => sum + item.quantity, 0)} phần ăn
                    </p>
                  </div>
                </div>

                <div className='border border-gray-400'></div>

                {/* Danh sách món ăn của nhà hàng này */}
                <div className="space-y-3 mt-6">
                  {Array.isArray(restaurant.items) && restaurant.items.map((item) => (
                    <div key={`${item.restaurant_id}-${item.food_id}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url || 'https://via.placeholder.com/40'}
                          alt={item.food_name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                        />
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm">{item.food_name}</h4>
                          <p className="text-xs text-gray-500">x{item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Địa chỉ giao hàng */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaMapMarkerAlt className="w-5 h-5 text-green-600" />
                  Địa chỉ giao hàng
                </h3>

                <button className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-colors">
                  <FaEdit className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaUser className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{userInfos.name}</span>
                </div>

                <div className="flex items-center gap-3">
                  <FaPhone className="w-4 h-4 text-gray-500" />
                  <span>{userInfos.phone}</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="w-4 h-4 text-gray-500 mt-0.5" />

                  <div className='w-full'>
                    <p className="text-gray-800 mb-3">
                      {userLocation.location}
                    </p>

                    <textarea
                      maxLength={100}
                      className="text-sm text-gray-600 mt-1 placeholder:text-gray-400 w-full sm:w-[375px] p-2 rounded border border-gray-300"
                      placeholder="Ghi chú cho người giao hàng (Tối đa 100 ký tự)"
                      value={userInfos.note}
                      onChange={(e) => setUserInfos({ ...userInfos, note: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaCreditCard className="w-5 h-5 text-green-600" />
                Phương thức thanh toán
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-green-300 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-green-600"
                  />
                  <FaWallet className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <span className="font-medium">Tiền mặt</span>
                    <p className="text-sm text-gray-600">Thanh toán khi nhận hàng</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-green-300 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-green-600"
                  />
                  <FaCreditCard className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <span className="font-medium">Thẻ tín dụng/ghi nợ</span>
                    <p className="text-sm text-gray-600">Visa, Mastercard, JCB</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-green-300 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="momo"
                    checked={paymentMethod === 'momo'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-green-600"
                  />
                  <div className="w-5 h-5 bg-pink-500 rounded flex items-center justify-center text-white text-xs font-bold">M</div>
                  <div className="flex-1">
                    <span className="font-medium">Ví MoMo</span>
                    <p className="text-sm text-gray-600">Thanh toán qua ví điện tử</p>
                  </div>
                </label>
              </div>
            </div>
          </div>


          {/* Cột phải - Tóm tắt đơn hàng */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaShoppingBag className="w-5 h-5 text-green-600" />
                Tóm tắt đơn hàng
              </h3>
              
              {/* Tóm tắt theo nhà hàng */}
              <div className="space-y-3 mb-6">
                {Array.isArray(cartData) && cartData.map((restaurant) => {
                  if (!restaurant.items || !Array.isArray(restaurant.items)) return null;
                  
                  const restaurantTotal = restaurant.items.reduce((sum, item) => 
                    sum + (item.price * item.quantity), 0
                  );
                  const itemCount = restaurant.items.reduce((sum, item) => sum + item.quantity, 0);
                  
                  return (
                    <div key={restaurant.restaurant_id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        {/* 
                          truncate = overflow: hidden; text-overflow: ellipsis; white-space: nowrap; 
                          - Đại khái tác dụng là nếu tên nhà hàng quá dài thì sẽ hiển thị ... ở cuối
                        */}
                        <h4 className="font-medium text-sm text-gray-800 truncate">
                          {restaurant.restaurant_name}
                        </h4>

                        <span className="text-sm font-semibold text-green-600">
                          {restaurantTotal.toLocaleString()}đ
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{itemCount} món</p>
                    </div>
                  );
                })}
              </div>

              {/* Tổng cộng */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính ({getTotalItems()} món)</span>
                  <span>{subtotal.toLocaleString()}đ</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí giao hàng</span>
                  <span>{deliveryFee.toLocaleString()}đ</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí dịch vụ (5%)</span>
                  <span>{serviceFee.toLocaleString()}đ</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-semibold text-gray-800">Tổng cộng</span>
                  <span className="font-bold text-xl text-green-600">
                    {totalAmount.toLocaleString()}đ
                  </span>
                </div>
              </div>

              {/* Nút đặt hàng */}
              <button
                onClick={handlePlaceOrder}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition-colors mt-6 shadow-lg 
                  hover:shadow-xl cursor-pointer
                "
              >
                Đặt hàng • {totalAmount.toLocaleString()}đ
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-3">
                Bằng việc đặt hàng, bạn đồng ý với Điều khoản sử dụng của chúng tôi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;