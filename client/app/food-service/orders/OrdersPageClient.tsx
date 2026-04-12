"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';

type OrderStatus = 'pending' | 'processing' | 'delivering' | 'delivered' | 'cancelled';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
type StageState = 'done' | 'current' | 'waiting'; //note lại

interface Order {
  id: number;
  order_code: string;
  restaurant_name: string;
  restaurant_image?: string;
  order_preview_image?: string;
  order_preview_name?: string;
  user_name: string;
  user_phone: string;
  delivery_address: string;
  total_amount: string;
  original_total?: string;
  discount_amount?: string;
  coupon_code?: string | null;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  notes?: string;
  created_at: string;
  delivery_fee: string;
  meal_slot?: 'breakfast' | 'lunch' | 'dinner' | null;
  deliver_by?: string | null;
}

interface FlowStage {
  key: string;
  title: string;
  description: string;
  image: string;
}

/*
  tạm thời set data cứng như này cho các phân đoạn ở dưới.
*/


// bổ sung vào giai đoạn trong mỗi đơn hàng.
// hiển thị các bước tương ứng với mỗi giai đoạn
const ORDER_FLOW_STAGES: FlowStage[] = [
  {
    key: 'payment',
    title: 'Thanh toán xác nhận',
    description: 'Đơn hàng đã được ghi nhận hợp lệ trong hệ thống.',
    image: '/assets/trans-1.jpg',
  },
  {
    key: 'preparing',
    title: 'Nhà hàng chuẩn bị món',
    description: 'Nhà hàng phân công bếp và bắt đầu sơ chế, nấu và đóng gói.',
    image: '/assets/food-images/intro-1.png',
  },
  {
    key: 'delivering',
    title: 'Tài xế đang giao',
    description: 'Đơn đã rời nhà hàng và đang trên đường đến khách hàng.',
    image: '/assets/ship-1.jpg',
  },
  {
    key: 'completed',
    title: 'Giao thành công',
    description: 'Đơn đã hoàn tất và cập nhật trạng thái giao thành công.',
    image: '/assets/ship-2.jpg',
  },
];

// giai đoạn để đặt món
const MEAL_SLOT_RULES = [
  { slot: 'Ăn sáng', window: '06:00 - 10:00', cutoff: 'Đặt trước tối thiểu 45 phút' },
  { slot: 'Ăn trưa', window: '10:30 - 14:00', cutoff: 'Đặt trước tối thiểu 60 phút' },
  { slot: 'Ăn tối', window: '17:00 - 21:00', cutoff: 'Đặt trước tối thiểu 75 phút' },
];

const toNumber = (value: string | number | null | undefined) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getOrderStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'processing':
      return 'bg-sky-50 text-sky-700 border border-sky-200';
    case 'delivering':
      return 'bg-violet-50 text-violet-700 border border-violet-200';
    case 'delivered':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
};

const getPaymentStatusColor = (status: PaymentStatus) => {
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

const orderStatusTranslator = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'Đơn mới';
    case 'processing':
      return 'Nhà hàng đang chuẩn bị';
    case 'delivering':
      return 'Đang giao hàng';
    case 'delivered':
      return 'Hoàn thành';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};

const paymentStatusTranslator = (status: PaymentStatus) => {
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

const getFlowProgress = (order: Order): number => {
  if (order.order_status === 'cancelled') {
    return -1;
  }
  if (order.order_status === 'delivered') {
    return 3;
  }
  if (order.order_status === 'delivering') {
    return 2;
  }
  if (order.order_status === 'processing') {
    return 1;
  }

  return order.payment_status === 'paid' ? 0 : -1;
};

const getStageState = (order: Order, stageIndex: number): StageState => {
  const progress = getFlowProgress(order);

  if (progress > stageIndex) {
    return 'done';
  }
  if (progress === stageIndex) {
    return 'current';
  }

  return 'waiting';
};

const getStageStyle = (state: StageState) => {
  if (state === 'done') {
    return 'border-emerald-300 bg-emerald-50 text-emerald-700';
  }
  if (state === 'current') {
    return 'border-blue-300 bg-blue-50 text-blue-700';
  }
  return 'border-gray-200 bg-gray-50 text-gray-500';
};

/* 
  giả định thời gian
  - data cứng
*/
const getSampleSchedule = (deliverByText: string) => {
  const deliverBy = dayjs(deliverByText);
  if (!deliverBy.isValid()) {
    return null;
  }

  const travelTimeMin = 25;
  const pickupBufferMin = 10;
  const cookTimeMin = 30;
  const packTimeMin = 10;
  const queueTimeMin = 15;

  const pickupAt = deliverBy.subtract(travelTimeMin + pickupBufferMin, 'minute');
  const packAt = pickupAt.subtract(packTimeMin, 'minute');
  const cookAt = packAt.subtract(cookTimeMin, 'minute');
  const prepAt = cookAt.subtract(queueTimeMin, 'minute');

  return {
    deliverBy,
    pickupAt,
    packAt,
    cookAt,
    prepAt,
  };
};

export default function OrdersPageClient({ initialOrders = [] }: { initialOrders?: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrderImage, setSelectedOrderImage] = useState<{ src: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filteredStatus, setFilteredStatus] = useState<'all' | OrderStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  const fetchOrders = async () => {
    try {
      const storedData = localStorage.getItem('userData');
      if (!storedData) {
        setOrders([]);
        return;
      }

      const parsed = JSON.parse(storedData);
      const userId = parsed.user_id;
      if (!userId) {
        setOrders([]);
        return;
      }

      const res = await fetch(`http://localhost:5001/api/orders/user/${userId}`);
      const data = await res.json();

      if (data?.success && Array.isArray(data.data)) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Lỗi lấy đơn hàng:', error);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await fetchOrders();
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      void fetchOrders();
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, []);

  const cancelOrder = async (orderId: number) => {
    try {
      const res = await fetch(`http://localhost:5001/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!res.ok) {
        throw new Error('Không hủy được đơn hàng');
      }

      await fetchOrders();
    } catch (err) {
      console.error('Lỗi khi hủy đơn hàng:', err);
    }
  };

  const filteredOrders = useMemo(() => {
    if (filteredStatus === 'all') {
      return orders;
    }
    return orders.filter((order) => order.order_status === filteredStatus);
  }, [orders, filteredStatus]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredStatus]);

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

      <div className="flex flex-wrap items-center justify-center gap-6 my-10 text-gray-600">
        {[
          { label: 'Tất cả', value: 'all' },
          { label: 'Đơn mới', value: 'pending' },
          { label: 'Nhà hàng chuẩn bị', value: 'processing' },
          { label: 'Đang giao hàng', value: 'delivering' },
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

      <div className="text-center text-gray-600 mb-4">
        Tìm thấy <span className="font-bold text-blue-600">{filteredOrders.length}</span> đơn hàng
      </div>

      {paginatedOrders.length === 0 ? (
        <p className="text-gray-500 text-center text-lg py-10">Hiện tại không có đơn hàng nào.</p>
      ) : (
        <>
          <div className="grid gap-6 mb-10 justify-center">
            {paginatedOrders.map((order) => {
              const minutesPassed = dayjs().diff(dayjs(order.created_at), 'minute');
              const canCancelOrder =
                (order.order_status === 'pending' || order.order_status === 'processing') &&
                minutesPassed < 5;
              const hasCouponCode = Boolean(order.coupon_code?.trim());
              const discountValue = toNumber(order.discount_amount);
              const originalTotalValue = toNumber(order.original_total);
              const hasEffectiveDiscount = hasCouponCode && discountValue > 0;
              const hasIneffectiveCoupon = hasCouponCode && discountValue <= 0;

              const sampleSchedule = getSampleSchedule(order.deliver_by || dayjs(order.created_at).add(8, 'hour').toISOString());

              return (
                <div
                  key={order.id}
                  className="w-full lg:w-[820px] md:w-[760px] mx-auto rounded-2xl bg-white shadow-md hover:shadow-xl transition-all hover:-translate-y-1 p-5 duration-150"
                >
                  <div className="flex flex-col md:flex-row gap-5">
                    <div className="relative w-full max-h-56 md:w-40 md:h-40 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                      <img
                        src={order.restaurant_image || '/images/placeholder.png'}
                        alt={order.restaurant_name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3 gap-3">
                        <div>
                          <h3 className="text-xl font-bold uppercase tracking-wide">{order.restaurant_name}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Mã đơn: <span className="font-mono font-semibold">{order.order_code}</span>
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getOrderStatusColor(order.order_status)}`}>
                            {orderStatusTranslator(order.order_status)}
                          </span>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                            {paymentStatusTranslator(order.payment_status)}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-1">
                        <span className="font-semibold">Địa chỉ:</span> {order.delivery_address}
                      </p>

                      <p className="text-gray-700 mb-1">
                        <span className="font-semibold">Ghi chú:</span> {order.notes?.trim() ? order.notes : 'Không có'}
                      </p>

                      <p className="text-gray-500 text-sm mb-3">
                        <span className="font-semibold">Thời gian tạo:</span>{' '}
                        {dayjs(order.created_at).format('DD/MM/YYYY, HH:mm:ss')}
                      </p>

                      {hasEffectiveDiscount && (
                        <p className="text-sm text-green-700 mb-3">
                          <span className="font-semibold">Coupon:</span> {order.coupon_code} (-{discountValue.toLocaleString()}đ)
                        </p>
                      )}

                      {hasIneffectiveCoupon && (
                        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                          <span className="font-semibold">Coupon:</span> {order.coupon_code} Đơn hàng chưa thỏa mãn điều kiện để được giảm giá
                        </p>
                      )}

                      <div className="mb-3">
                        <button
                          onClick={() => {
                            const previewSrc = order.order_preview_image || order.restaurant_image || '/images/placeholder.png';
                            const previewTitle = order.order_preview_name || `Đơn ${order.order_code}`;
                            setSelectedOrderImage({ src: previewSrc, title: previewTitle });
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Xem ảnh đơn hàng
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-auto">
                        <div className="font-bold text-xl text-orange-600">
                          {toNumber(order.total_amount).toLocaleString()}đ
                          {discountValue > 0 && originalTotalValue > 0 && (
                            <p className="text-xs text-gray-500 font-normal mt-1">
                              Giá gốc: {originalTotalValue.toLocaleString()}đ
                            </p>
                          )}
                        </div>

                        {(order.order_status === 'pending' || order.order_status === 'processing') && (
                          <div className="flex flex-col items-end">
                            <button
                              onClick={() => cancelOrder(order.id)}
                              disabled={!canCancelOrder}
                              className={`px-4 py-2 border rounded-xl text-sm font-semibold transition
                                ${
                                  !canCancelOrder
                                    ? 'text-gray-400 border-gray-300 cursor-not-allowed bg-gray-100'
                                    : 'text-red-600 border-red-400 hover:bg-red-50'
                                }
                              `}
                            >
                              Hủy đơn
                            </button>

                            {!canCancelOrder && (
                              <p className="text-xs text-gray-400 mt-1 italic">Không thể hủy sau 5 phút</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Luồng chuẩn bị và giao món</h4>

                    {order.order_status === 'cancelled' ? (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                        Đơn hàng đã bị hủy. Luồng chuẩn bị và giao hàng được dừng.
                      </div>
                    ) : (
                      <div className="overflow-x-auto pb-2">
                        <div className="min-w-[720px]">
                          <div className="flex items-start">
                            {ORDER_FLOW_STAGES.map((stage, index) => {
                              const state = getStageState(order, index);
                              const label = state === 'done' ? 'Hoàn tất' : state === 'current' ? 'Đang thực hiện' : 'Đang chờ';

                              return (
                                <div key={`${order.id}-${stage.key}`} className="flex items-start flex-1">
                                  <div className="flex-1">
                                    <div className="flex items-center">
                                      <div
                                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                                          state === 'done'
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : state === 'current'
                                            ? 'bg-blue-500 border-blue-500 text-white'
                                            : 'bg-white border-gray-300 text-gray-500'
                                        }`}
                                      >
                                        {index + 1}
                                      </div>

                                      {index < ORDER_FLOW_STAGES.length - 1 && (
                                        <div className="flex-1 h-[2px] mx-2 bg-gray-200 relative">
                                          <div
                                            className={`absolute left-0 top-0 h-full ${
                                              state === 'done' ? 'bg-emerald-500 w-full' : state === 'current' ? 'bg-blue-500 w-1/2' : 'w-0'
                                            }`}
                                          />
                                        </div>
                                      )}
                                    </div>

                                    <div className="mt-3 pr-2">
                                      <p
                                        className={`text-xs uppercase tracking-wide font-semibold mb-1 ${
                                          state === 'done'
                                            ? 'text-emerald-700'
                                            : state === 'current'
                                            ? 'text-blue-700'
                                            : 'text-gray-500'
                                        }`}
                                      >
                                        {label}
                                      </p>
                                      <p className="text-sm font-semibold text-gray-800 leading-5">{stage.title}</p>
                                      <p className="text-xs text-gray-500 mt-1 leading-5">{stage.description}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {sampleSchedule && (
                    <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-4">
                      <h5 className="text-sm font-semibold text-gray-800 mb-2">Mốc thời gian dự kiến cho đơn hẹn giờ</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                        <p>Thời điểm bắt đầu chuẩn bị: <span className="font-semibold">{sampleSchedule.prepAt.format('HH:mm')}</span></p>
                        <p>Thời điểm bắt đầu nấu: <span className="font-semibold">{sampleSchedule.cookAt.format('HH:mm')}</span></p>
                        <p>Thời điểm đóng gói: <span className="font-semibold">{sampleSchedule.packAt.format('HH:mm')}</span></p>
                        <p>Thời điểm tài xế nhận món: <span className="font-semibold">{sampleSchedule.pickupAt.format('HH:mm')}</span></p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mb-20">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      <div className="rounded-2xl bg-white border border-gray-200 p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quy tắc đặt trước theo bữa ăn và đơn hẹn giờ</h2>

        <div className="grid md:grid-cols-3 gap-4 mb-5">
          {MEAL_SLOT_RULES.map((rule) => (
            <div key={rule.slot} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">{rule.slot}</p>
              <p className="text-sm text-gray-700 mt-1">Khung giờ phục vụ: {rule.window}</p>
              <p className="text-sm text-gray-700 mt-1">Điều kiện nhận đơn: {rule.cutoff}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-semibold mb-2">Ví dụ đặt lúc 10:00 và yêu cầu giao trước 18:00</p>
          <p>
            Đây là đơn hẹn giờ. Hệ thống sẽ không nấu ngay lúc 10:00 mà tính ngược từ mốc giao mong muốn.
            Món ăn sẽ được chuẩn bị vào khung giờ gần thời điểm giao để đảm bảo chất lượng, hạn chế để món quá lâu.
            Với món cần giữ nhiệt, nhà hàng đóng gói nhiệt trước khi bàn giao tài xế.
          </p>
        </div>
      </div>

      {selectedOrderImage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">{selectedOrderImage.title}</h3>
              <button
                onClick={() => setSelectedOrderImage(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                x
              </button>
            </div>
            <img
              src={selectedOrderImage.src}
              alt={selectedOrderImage.title}
              className="w-full h-80 object-contain rounded-lg bg-gray-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}
