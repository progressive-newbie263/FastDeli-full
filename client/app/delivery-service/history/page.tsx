"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDeliveryAuth } from '../context/DeliveryAuthContext';
import { 
  ChevronLeft, 
  Package, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Loader2,
  Calendar,
  CreditCard
} from 'lucide-react';

const API_BASE = "http://localhost:5002/api";

interface ShipmentHistory {
  id: number;
  status: string;
  price: number;
  pickup_address: string;
  dropoff_address: string;
  created_at: string;
}

const orderDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const orderTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
});

const formatOrderDate = (value: string) => orderDateFormatter.format(new Date(value));
const formatOrderTime = (value: string) => orderTimeFormatter.format(new Date(value));

const translateShipmentStatus = (status: string) => {
  switch (status) {
    case 'SEARCHING_DRIVER':
      return 'Đang tìm tài xế';
    case 'DRIVER_ACCEPTED':
      return 'Tài xế đã nhận';
    case 'PICKED_UP':
      return 'Đã lấy hàng';
    case 'DELIVERED':
      return 'Đã giao';
    case 'CANCELLED':
      return 'Đã huỷ';
    default:
      return status.replace(/_/g, ' ');
  }
};

export default function DeliveryHistoryPage() {
  const { currentUser, isAuthenticated, loading: authLoading } = useDeliveryAuth();
  const [history, setHistory] = useState<ShipmentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const latestOrder = history[0];

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchHistory();
    } else if (!authLoading && !isAuthenticated) {
        setLoading(false);
    }
  }, [isAuthenticated, currentUser, authLoading]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/shipments/history?user_id=${currentUser?.user_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('delivery_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl max-w-md w-full">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-slate-800 mb-2">Truy cập bị từ chối</h1>
            <p className="text-slate-500 mb-8 font-medium">Vui lòng đăng nhập để xem lịch sử giao hàng của bạn.</p>
            <Link 
            href="/delivery-service/auth/login"
            className="block w-full bg-emerald-600 text-white py-4 rounded-2xl font-medium transition-all hover:bg-emerald-700 shadow-lg shadow-emerald-200"
            >
            Đăng nhập ngay
            </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 text-slate-900 pb-20 font-sans">
      <div className="max-w-2xl mx-auto p-4 md:py-12">
        
        <Link 
          href="/delivery-service" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-medium text-sm mb-8 transition-colors group"
        >
          <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
            <ChevronLeft size={18} />
          </div>
          Quay lại đặt hàng
        </Link>
          <div className="mb-8 rounded-[2.5rem] border border-white bg-white p-5 shadow-xl shadow-slate-200/50 md:p-6 lg:p-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="max-w-xl space-y-2">
                <p className="text-[11px] font-semibold tracking-normal text-emerald-600">Lịch sử giao hàng</p>
                <h1 className="text-3xl font-semibold text-slate-800 md:text-[2.35rem]">Các đơn đã đặt</h1>
                <p className="max-w-lg text-sm font-medium leading-relaxed text-slate-500">
                  Xem nhanh trạng thái, thời gian đặt và chi tiết từng đơn hàng đã giao hoặc đang giao.
                </p>
              </div>
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:w-[300px] md:flex-shrink-0 lg:w-[320px] lg:grid-cols-1">
                <div className="rounded-2xl bg-emerald-50 p-3.5 md:p-4">
                  <p className="text-[10px] font-semibold tracking-normal text-emerald-700">Tổng đơn</p>
                  <p className="mt-1 text-[1.7rem] font-semibold leading-none text-emerald-900">{history.length}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3.5 md:p-4">
                  <p className="text-[10px] font-semibold tracking-normal text-slate-500">Đặt gần nhất</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {latestOrder ? formatOrderTime(latestOrder.created_at) : '--'}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400">
                    {latestOrder ? formatOrderDate(latestOrder.created_at) : 'Chưa có dữ liệu'}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-950 p-3.5 text-white sm:col-span-2 md:col-span-1 md:p-4">
                  <p className="text-[10px] font-semibold tracking-normal text-slate-400">Trạng thái gần nhất</p>
                  <p className="mt-1 text-sm font-semibold">{latestOrder ? translateShipmentStatus(latestOrder.status) : 'Chưa có đơn'}</p>
                </div>
              </div>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-xl shadow-slate-200/50">
              <Package className="w-20 h-20 text-slate-100 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Chưa có đơn hàng nào</h3>
              <p className="text-slate-400 font-medium mb-8">Bắt đầu trải nghiệm dịch vụ giao hàng hoả tốc ngay hôm nay!</p>
              <Link 
                href="/delivery-service"
                className="inline-flex bg-emerald-600 text-white px-8 py-4 rounded-2xl font-medium transition-all hover:bg-emerald-700 shadow-lg shadow-emerald-200"
              >
                Đặt đơn đầu tiên
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {history.map((item, index) => {
                const isLatest = index === 0;

                return (
                  <div 
                    key={item.id}
                    className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-50 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-600">
                          <Package size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-400 tracking-normal">Đơn hàng #{item.id}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                            <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1">
                              <Calendar size={12} />
                              <span>{formatOrderDate(item.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                              <Clock size={12} />
                              <span>{formatOrderTime(item.created_at)}</span>
                            </div>
                            {isLatest ? (
                              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold tracking-normal text-emerald-700">
                                Mới nhất
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-normal border ${
                        item.status === 'DELIVERED' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {translateShipmentStatus(item.status)}
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500"></div>
                        <p className="text-sm font-medium text-slate-600 line-clamp-1">{item.pickup_address}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-rose-500"></div>
                        <p className="text-sm font-medium text-slate-600 line-clamp-1">{item.dropoff_address}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                       <div className="flex items-center gap-2 text-slate-400">
                          <CreditCard size={16} />
                           <span className="text-xs font-semibold tracking-normal">Tiền mặt</span>
                       </div>
                       <p className="text-xl font-semibold text-slate-800 italic">
                          {Number(item.price).toLocaleString()}đ
                       </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </main>
  );
}
