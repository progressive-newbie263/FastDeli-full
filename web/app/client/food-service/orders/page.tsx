'use client';

import React, { useEffect, useState } from 'react';
import { FaBox, FaSpinner } from 'react-icons/fa';
import dayjs from 'dayjs';

// note: fix lại interface (do trước đó ở lần push này đã phải fix lại database)
interface Order {
  id: number;
  order_code: string;

  //restaurant_id: number;
  restaurant_name: string;
  restaurant_image?: string;

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
          console.log(data.data);
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

  // status đơn hàng
  // tạm thời sẽ có trạng thái processing cho order và paid cho payment là chính.
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'refunded':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // dịch status sang tiếng việt
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
  }

  const paymentStatusTranslator = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Đang chờ xử lý';
      case 'paid':
        return 'Đã thanh toán';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return status;
    }
  }

  return (
    <div className="container mx-auto px-16 py-6 mt-20">
      <h1 className="text-2xl font-bold mb-6">Lịch sử đặt hàng</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">Chưa có đơn hàng nào.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-xl shadow p-4 bg-white flex flex-col md:flex-row gap-4"
            >
              {/* Ảnh nhà hàng */}
              <img
                src={order.restaurant_image || '/images/placeholder.png'}
                alt={order.restaurant_name}
                className="w-full md:w-40 h-40 object-cover rounded-xl border"
              />

              {/* Nội dung */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold uppercase">{order.restaurant_name}</h3>
                  <div className="flex gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getOrderStatusColor(
                        order.order_status
                      )}`}
                    >
                      {orderStatusTranslator(order.order_status)}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                        order.payment_status
                      )}`}
                    >
                      {paymentStatusTranslator(order.payment_status)}
                    </span>
                  </div>
                </div>

                {/* Địa chỉ */}
                <p className="text-gray-700 mb-1">
                  <span className="font-semibold">Địa chỉ:</span> {order.delivery_address}
                </p>

                {/* Ghi chú */}
                <p className="text-gray-700 mb-1">
                  <span className="font-semibold">Ghi chú:</span>{' '}
                  {order.notes?.trim() ? order.notes : 'Không có'}
                </p>

                {/* Thời gian */}
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold">Thời gian đặt hàng:</span>{' '}
                  {dayjs(order.created_at).format('DD/MM/YYYY, HH:mm:ss')}
                </p>

                {/* Tổng tiền */}
                <div className="font-semibold text-lg mt-3 text-orange-600 text-right">
                  Tổng: {parseFloat(order.total_amount).toLocaleString()}₫
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
