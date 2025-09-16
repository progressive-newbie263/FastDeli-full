'use client';

import React, { useEffect, useState } from 'react';
import { FaBox, FaSpinner } from 'react-icons/fa';
import dayjs from 'dayjs';

interface Order {
  order_id: number;
  restaurant_id: number;
  user_name: string;
  user_phone: string;
  delivery_address: string;
  total_amount: string;
  order_status: string;
  notes?: string;
  created_at: string;
  delivery_fee: string;
  payment_status: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
          setOrders(data.data);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-600">
        <FaSpinner className="animate-spin text-3xl" />
      </div>
    );
  }

  // 🔥 Lọc đơn hàng đang pending
  const pendingOrders = orders.filter((o) => o.order_status === 'pending');

  return (
    <div className="container mx-auto px-4 py-6 mt-20">
      <h1 className="text-2xl font-bold mb-6">Các đơn hàng đã bán</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaBox className="text-orange-500" /> Đơn hàng đang chờ xử lý
        </h2>
        {pendingOrders.length === 0 ? (
          <p className="text-gray-500">Không có đơn hàng nào.</p>
        ) : (
          <div className="grid gap-4">
            {pendingOrders.map((order) => (
              <div
                key={order.order_id}
                className="border rounded-xl shadow p-4 bg-white position-relative"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold">
                    Nhà hàng #{order.restaurant_id}
                  </h3>
                  <span className="px-2 py-1 text-sm bg-orange-100 text-orange-700 rounded-md">
                    {order.order_status === 'pending'
                      ? 'Đang chờ xử lý'
                      : order.order_status}
                  </span>
                </div>

                {/* <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Khách:</span> {order.user_name} ({order.user_phone})
                </p> */}
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Địa chỉ:</span> {order.delivery_address}
                </p>
                {order.notes && (
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Ghi chú:</span> {order.notes}
                  </p>
                )}

                <div className="flex items-center gap-3">
                  <p className='font-semibold text-gray-700'>Thời gian đặt hàng: </p>
                  
                  <span className='text-gray-600'>
                    {dayjs(order.created_at).format('DD/MM/YYYY, HH:mm:ss')}
                  </span>
                </div>

                <div className='font-semibold position-absolute text-lg mt-4 text-orange-600 right-0'>
                  Tổng: {parseFloat(order.total_amount).toLocaleString()}₫  
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
