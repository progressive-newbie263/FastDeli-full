import React from 'react';

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
  restaurant_image?: string;
  items: CartItem[];
}

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
      {/* Backdrop mờ */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors text-2xl w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
          <div className="flex items-center gap-4">
            <img
              src={restaurant.restaurant_image || 'https://via.placeholder.com/60'}
              alt={restaurant.restaurant_name}
              className="w-16 h-16 object-cover rounded-lg border-2 border-white/20"
            />
            <div>
              <h2 className="text-2xl font-bold">🍽️ {restaurant.restaurant_name}</h2>
              <p className="text-green-100 text-sm">
                {restaurant.items.length} món trong đơn hàng
              </p>
            </div>
          </div>
        </div>

        {/* Body - Danh sách món ăn */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
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
                    className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="font-semibold text-lg w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onIncrease(item.food_id, item.restaurant_id)}
                    className="bg-green-500 hover:bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
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
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-medium transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={() => onCheckout(restaurant.restaurant_id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Thanh toán đơn này
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPopup;