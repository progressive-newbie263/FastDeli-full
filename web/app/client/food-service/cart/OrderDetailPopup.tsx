import React from 'react';
import { Utensils } from 'lucide-react';

import { RestaurantGroup } from '../utils/cartHandler';
import Link from 'next/link';


interface Props {
  restaurant: RestaurantGroup;
  onClose: () => void;
  onIncrease: (food_id: number, restaurant_id: string) => void;
  onDecrease: (food_id: number, restaurant_id: string) => void;
  onCheckout: (restaurant_id: string) => void;
  getGroupTotal: (group: RestaurantGroup) => number;
}

const OrderDetailPopup: React.FC<Props> = ({
  restaurant,
  onClose,
  onIncrease,
  onDecrease,
  onCheckout,
  getGroupTotal
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 
        Backdrop mờ. blur-xs là nhỏ nhất/ nét nhất theo mặc định (4px) nên để [2px] sẽ giúp nó nét hơn xs 1 tí.
          - Áp đặt lớp backdrop này lên toàn trang. 
      */}
      <div 
        className="absolute top-16 inset-x-0 bottom-0 bg-opacity-50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-green-500 to-green-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white transition-colors text-xl w-8 h-8 flex items-center justify-center
              cursor-pointer hover:text-gray-300 duration-100 
          ">
            X
          </button>

          <div className="flex items-center gap-4">
            <img
              src={restaurant.restaurant_image || 'https://via.placeholder.com/60'}
              alt={restaurant.restaurant_name}
              className="w-16 h-16 object-cover rounded-lg border-2 border-white/20"
            />

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-3">
                <Link className='flex items-center gap-2' href={`/client/food-service/restaurants/${restaurant.restaurant_id}`}>
                  <Utensils className="text-xl text-gray-300" />
                  {restaurant.restaurant_name}
                </Link>
              </h2>

              <p className="text-green-100 text-sm">
                {restaurant.items.length} món trong đơn hàng
              </p>
            </div>
          </div>
        </div>

        {/* Body - Danh sách món ăn */}
        <div className="p-6 max-h-[40vh] overflow-y-auto">
          <div className="space-y-4">
            {restaurant.items.map(item => (
              <div
                key={`${item.restaurant_id}-${item.food_id}`}
                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0"
              >
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={item.image_url || 'https://via.placeholder.com/80'}
                    alt={item.food_name}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {item.food_name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.description || 'Không có mô tả'}
                    </p>
                    <p className="text-sm font-medium text-green-600 mt-1">
                      {item.price.toLocaleString()} đ
                    </p>
                  </div>
                </div>

                {/* Điều chỉnh số lượng */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onDecrease(item.food_id, item.restaurant_id)}
                    className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors 
                      cursor-pointer duration-150"
                  >
                    -
                  </button>

                  <span className="font-semibold text-lg w-8 text-center">
                    {item.quantity}
                  </span>
                  
                  <button
                    onClick={() => onIncrease(item.food_id, item.restaurant_id)}
                    className="bg-green-500 hover:bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors 
                      cursor-pointer duration-150"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* nút gọi thêm món (điều hướng về nhà hàng chủ quản để chọn thêm các món từ nhà hàng đó.) */}
          <div className='hover:underline text-green-600 font-semibold duration-150 w-fit mx-auto'>
            <Link className='flex gap-2' href={`/client/food-service/restaurants/${restaurant.restaurant_id}`}>
              + Gọi thêm món
            </Link>
          </div>
        </div>



        {/* Footer */}
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-700">
              Tổng cộng:
            </span>

            <span className="text-2xl font-bold text-green-600">
              {getGroupTotal(restaurant).toLocaleString()} đ
            </span>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-medium transition-colors cursor-pointer duration-150"
            >
              Đóng
            </button>

            {/* tạm thời cứ để checkout là xóa đi (coi như ko cần chuyển tiền, nó xong luôn) */}
            <button
              onClick={() => onCheckout(restaurant.restaurant_id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer duration-150"
            >
              
              Thanh toán đơn hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPopup;