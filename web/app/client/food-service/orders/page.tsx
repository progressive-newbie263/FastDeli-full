'use client';

import React, { useEffect, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
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
  order_status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  delivery_fee: string;
  payment_status: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  // đặt state cho bộ lọc order.
  // tạm thời chỉ sử dụng 4 state này. Sau này khi phát triển thêm, sẽ có thêm state như "delivering". 
  // "processing" sẽ là hiển thị mặc định khi load.
  const [filteredOrder, setFilteredOrder] = useState<'pending' | 'processing' | 'completed' | 'cancelled'>('processing')

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
          // ✅ Xử lý trạng thái processing → completed nếu quá 30 phút
          const processedData = data.data.map((order: Order) => {
            if (order.order_status === 'processing') {
              const createdTime = dayjs(order.created_at);
              if (now.diff(createdTime, 'minute') >= 30) {
                return { ...order, order_status: 'completed' };
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
      case 'completed':
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
      case 'completed':
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
        <FaSpinner className="animate-spin text-3xl" />
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
          { label: 'Hoàn thành', value: 'completed' },
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
        <div className="grid gap-10 mb-20">
          {selectedOrders.map((order) => {
            const canCancel =
              (order.order_status === 'pending' || order.order_status === 'processing') &&
              dayjs().diff(dayjs(order.created_at), 'minute') < 5;

            return (
              <div
                key={order.id}
                className="rounded-2xl bg-white shadow-md hover:shadow-xl transition-all hover:-translate-y-1 
                  flex flex-col md:flex-row gap-5 p-5 cursor-pointer duration-150"
              >
                <img
                  src={order.restaurant_image || '/images/placeholder.png'}
                  alt={order.restaurant_name}
                  className="w-full md:w-40 h-40 object-cover rounded-xl border"
                />

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

                    {/* Nút Hủy đơn */}
                    {(order.order_status === 'pending' || order.order_status === 'processing') && (
                      <div className="mt-4 flex flex-col items-end">
                        <button
                          onClick={() => cancelOrder(order.id)}
                          disabled={dayjs().diff(dayjs(order.created_at), 'minute') >= 5}
                          className={`px-4 py-2 border rounded-xl text-sm font-semibold transition
                            ${dayjs().diff(dayjs(order.created_at), 'minute') >= 5
                                ? 'text-gray-400 border-gray-300 cursor-not-allowed bg-gray-100'
                                : 'text-red-600 border-red-400 hover:bg-red-50'
                            }`}
                        >
                          Hủy đơn
                        </button>

                        {dayjs().diff(dayjs(order.created_at), 'minute') >= 5 && (
                          <p className="text-xs text-gray-400 mt-1 italic">
                            Không thể hủy sau 5 phút.
                          </p>
                        )}
                      </div>
                    )}
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
