'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import dayjs from 'dayjs';

interface Order {
  id: number;
  order_code: string;
  restaurant_name: string;
  restaurant_image?: string;
  user_name: string;
  user_phone: string;
  delivery_address: string;
  total_amount: string;
  order_status: 'pending' | 'confirmed' | 'processing' | 'delivering' | 'delivered' | 'cancelled';
  notes?: string;
  created_at: string;
  delivery_fee: string;
  payment_status: string;
}

export default function OrdersPageClient({initialOrders = []}: {initialOrders?: Order[]}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [loading, setLoading] = useState(true);
  // tạm thời chỉ sử dụng 4 state này. Sau này khi phát triển thêm, sẽ có thêm state như "delivering". 
  // "processing" sẽ là hiển thị mặc định khi load.
  // rerender nó khi đủ 5 phút - thời gian giới hạn hủy đơn
  const [filteredOrder, setFilteredOrder] = useState<'pending' | 'processing' | 'delivered' | 'cancelled'>('processing')
  const [timeNow, setTimeNow] = useState(() => dayjs()); 

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeNow(dayjs()); 
    }, 5 * 60 * 1000); 

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const storedData = localStorage.getItem('userData');
        if (!storedData) {
          console.error('Không tìm thấy userData trong localStorage');
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(storedData);
        const userId = parsed.user_id;
        if (!userId) {
          console.error('Không tìm thấy user_id trong userData');
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:5001/api/orders/user/${userId}`);
        const data = await res.json();

        if (data?.success && Array.isArray(data.data)) {
          const now = dayjs();
          
          // sau 30 phút, cập nhật trạng thái đơn "processing"(đang xử lí) thành "delivered" (hoàn thành).
          const processedData = data.data.map((order: Order) => {
            if (order.order_status === 'processing') {
              const createdTime = dayjs(order.created_at);
              if (now.diff(createdTime, 'minute') >= 30) {
                return { ...order, order_status: 'delivered' };
              }
            }
            return order;
          });

          setOrders(processedData);
        } else {
          console.error('Lỗi khi lấy dữ liệu đơn hàng:', data);
        }
      } catch (error) {
        console.error('Lỗi lấy đơn hàng:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const cancelOrder = async (orderId: number) => {
    try {
      const res = await fetch(`http://localhost:5001/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!res.ok) throw new Error('Không hủy được đơn hàng');

      // ✅ Cập nhật UI ngay lập tức
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, order_status: 'cancelled' } : o))
      );
    } catch (err) {
      console.error('Lỗi khi hủy đơn hàng:', err);
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'delivered':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const orderStatusTranslator = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Đang chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'delivered':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const selectedOrders = orders.filter(order => order.order_status === filteredOrder);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-600">
        <Loader2 className="animate-spin text-3xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-16 py-6 mt-20">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800">Lịch sử đặt hàng</h1>

      {/* Bộ lọc */}
      <div className="flex flex-row items-center justify-center gap-12 my-10 text-gray-600">
        {[
          { label: 'Đang chờ', value: 'pending' },
          { label: 'Đang xử lí', value: 'processing' },
          { label: 'Hoàn thành', value: 'delivered' },
          { label: 'Đã hủy', value: 'cancelled' },
        ].map((filter) => (
          <div
            key={filter.value}
            onClick={() => setFilteredOrder(filter.value as typeof filteredOrder)}
            className={`cursor-pointer transition-all pb-1 ${
              filteredOrder === filter.value
                ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                : 'hover:text-blue-500'
            }`}
          >
            {filter.label}
          </div>
        ))}
      </div>

      {selectedOrders.length === 0 ? (
        <p className="text-gray-500 text-center text-lg">
          Hiện tại không có đơn hàng nào.
        </p>
      ) : (
        <div className="grid gap-10 mb-20 justify-center">
          {selectedOrders.map((order) => {
            const minutesPassed = timeNow.diff(dayjs(order.created_at), 'minute');
            const canCancelOrder = (order.order_status === 'pending' || order.order_status === 'processing') && minutesPassed < 5;

            return (
              <div key={order.id} 
                className="w-full lg:w-[750px] md:w-[700px] mx-auto rounded-2xl bg-white 
                shadow-md hover:shadow-xl transition-all hover:-translate-y-1 
                flex flex-col md:flex-row gap-5 p-5 cursor-pointer duration-150"
              >
                <div className="relative w-full max-h-56 md:w-40 md:h-40 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                  <img
                    src={order.restaurant_image || '/images/placeholder.png'}
                    alt={order.restaurant_name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold uppercase tracking-wide">
                      {order.restaurant_name}
                    </h3>
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getOrderStatusColor(
                          order.order_status
                        )}`}
                      >
                        {orderStatusTranslator(order.order_status)}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">📍 Địa chỉ:</span> {order.delivery_address}
                  </p>

                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">📝 Ghi chú:</span>{' '}
                    {order.notes?.trim() ? order.notes : 'Không có'}
                  </p>

                  <p className="text-gray-500 text-sm">
                    <span className="font-semibold">⏰ Thời gian:</span>{' '}
                    {dayjs(order.created_at).format('DD/MM/YYYY, HH:mm:ss')}
                  </p>

                  <div className="flex justify-between items-center mt-4">
                    <div className="font-bold text-xl text-orange-600">
                      💰 {parseFloat(order.total_amount).toLocaleString()}₫
                    </div>

                    {/* 
                        - Nút Hủy đơn 
                        - ép state rerender lại khi đủ 5 phút để cập nhật trạng thái nút hủy
                        - Trước 5p, bấm hủy sẽ thành công hủy đơn
                        - sau 5p thì nút hủy vô hiệu hóa + cảnh báo (nhắc nhở).
                    */}
                    {(order.order_status === 'pending' || order.order_status === 'processing') && 
                      (<div className="mt-4 flex flex-col items-end">
                        <button onClick={() => cancelOrder(order.id)} disabled={!canCancelOrder}
                          className={`px-4 py-2 border rounded-xl text-sm font-semibold transition
                            ${!canCancelOrder ? 'text-gray-400 border-gray-300 cursor-not-allowed bg-gray-100' : 'text-red-600 border-red-400 hover:bg-red-50'}
                          `}
                        >
                          Hủy đơn
                        </button>

                        {!canCancelOrder && (
                          <p className="text-xs text-gray-400 mt-1 italic">
                            Không thể hủy sau 5 phút.
                          </p>
                        )}
                      </div>
                      )
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
