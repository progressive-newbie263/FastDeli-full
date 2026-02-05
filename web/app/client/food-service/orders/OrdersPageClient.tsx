"use client"

import React, { useEffect, useState } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  order_status: 'pending' | 'processing' | 'delivering' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  created_at: string;
  delivery_fee: string;
}

export default function OrdersPageClient({initialOrders = []}: {initialOrders?: Order[]}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [loading, setLoading] = useState(true);
  const [filteredStatus, setFilteredStatus] = useState<'all' | 'pending' | 'processing' | 'delivered' | 'cancelled'>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ✅ Fetch orders từ API
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
          
          // ✅ Auto-update trạng thái order theo logic:
          // 1. pending + payment_status='paid' → processing (sau khi thanh toán)
          // 2. processing → delivered (sau 30 phút)
          const processedData = data.data.map((order: Order) => {
            const createdTime = dayjs(order.created_at);
            const minutesPassed = now.diff(createdTime, 'minute');

            // Nếu đơn đã thanh toán nhưng vẫn pending → chuyển processing
            if (order.order_status === 'pending' && order.payment_status === 'paid') {
              return { ...order, order_status: 'processing' };
            }

            // Nếu đơn processing > 30 phút → delivered
            if (order.order_status === 'processing' && minutesPassed >= 30) {
              return { ...order, order_status: 'delivered' };
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

  // ✅ Auto-refresh mỗi 5 phút để update trạng thái
  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs();
      
      setOrders(prev => prev.map(order => {
        const createdTime = dayjs(order.created_at);
        const minutesPassed = now.diff(createdTime, 'minute');

        // Auto-update logic
        if (order.order_status === 'pending' && order.payment_status === 'paid') {
          return { ...order, order_status: 'processing' };
        }

        if (order.order_status === 'processing' && minutesPassed >= 30) {
          return { ...order, order_status: 'delivered' };
        }

        return order;
      }));
    }, 5 * 60 * 1000); // 5 phút

    return () => clearInterval(interval);
  }, []);

  // ✅ Hủy đơn hàng (chỉ trong 5 phút đầu)
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

  // ✅ Filter orders theo status
  const filteredOrders = filteredStatus === 'all' 
    ? orders 
    : orders.filter(order => order.order_status === filteredStatus);

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // ✅ Reset page khi đổi filter
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredStatus]);

  // ✅ UI Helper functions
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'refunded':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const orderStatusTranslator = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ thanh toán';
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

  const paymentStatusTranslator = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chưa thanh toán';
      case 'paid':
        return 'Đã thanh toán';
      case 'failed':
        return 'Thất bại';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return status;
    }
  };

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

      {/* ✅ Bộ lọc trạng thái */}
      <div className="flex flex-wrap items-center justify-center gap-6 my-10 text-gray-600">
        {[
          { label: 'Tất cả', value: 'all' },
          { label: 'Chờ thanh toán', value: 'pending' },
          { label: 'Đang xử lí', value: 'processing' },
          { label: 'Hoàn thành', value: 'delivered' },
          { label: 'Đã hủy', value: 'cancelled' },
        ].map((filter) => (
          <div
            key={filter.value}
            onClick={() => setFilteredStatus(filter.value as typeof filteredStatus)}
            className={`cursor-pointer transition-all pb-1 px-3 ${
              filteredStatus === filter.value
                ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                : 'hover:text-blue-500'
            }`}
          >
            {filter.label}
          </div>
        ))}
      </div>

      {/* ✅ Hiển thị tổng số đơn */}
      <div className="text-center text-gray-600 mb-4">
        Tìm thấy <span className="font-bold text-blue-600">{filteredOrders.length}</span> đơn hàng
      </div>

      {paginatedOrders.length === 0 ? (
        <p className="text-gray-500 text-center text-lg py-10">
          Hiện tại không có đơn hàng nào.
        </p>
      ) : (
        <>
          {/* ✅ Danh sách đơn hàng */}
          <div className="grid gap-6 mb-10 justify-center">
            {paginatedOrders.map((order) => {
              const minutesPassed = dayjs().diff(dayjs(order.created_at), 'minute');
              const canCancelOrder = 
                (order.order_status === 'pending' || order.order_status === 'processing') && 
                minutesPassed < 5;

              return (
                <div key={order.id} 
                  className="w-full lg:w-[750px] md:w-[700px] mx-auto rounded-2xl bg-white 
                  shadow-md hover:shadow-xl transition-all hover:-translate-y-1 
                  flex flex-col md:flex-row gap-5 p-5 duration-150"
                >
                  {/* Image */}
                  <div className="relative w-full max-h-56 md:w-40 md:h-40 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                    <img
                      src={order.restaurant_image || '/images/placeholder.png'}
                      alt={order.restaurant_name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold uppercase tracking-wide">
                          {order.restaurant_name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Mã đơn: <span className="font-mono font-semibold">{order.order_code}</span>
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getOrderStatusColor(order.order_status)}`}>
                          {orderStatusTranslator(order.order_status)}
                        </span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                          💳 {paymentStatusTranslator(order.payment_status)}
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

                    <p className="text-gray-500 text-sm mb-3">
                      <span className="font-semibold">⏰ Thời gian:</span>{' '}
                      {dayjs(order.created_at).format('DD/MM/YYYY, HH:mm:ss')}
                    </p>

                    <div className="flex justify-between items-center mt-auto">
                      <div className="font-bold text-xl text-orange-600">
                        💰 {parseFloat(order.total_amount).toLocaleString()}₫
                      </div>

                      {/* ✅ Nút hủy đơn (chỉ trong 5 phút) */}
                      {(order.order_status === 'pending' || order.order_status === 'processing') && (
                        <div className="flex flex-col items-end">
                          <button 
                            onClick={() => cancelOrder(order.id)} 
                            disabled={!canCancelOrder}
                            className={`px-4 py-2 border rounded-xl text-sm font-semibold transition
                              ${!canCancelOrder 
                                ? 'text-gray-400 border-gray-300 cursor-not-allowed bg-gray-100' 
                                : 'text-red-600 border-red-400 hover:bg-red-50'}
                            `}
                          >
                            Hủy đơn
                          </button>

                          {!canCancelOrder && (
                            <p className="text-xs text-gray-400 mt-1 italic">
                              Không thể hủy sau 5 phút
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

          {/* ✅ Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mb-20">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-semibold transition ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}