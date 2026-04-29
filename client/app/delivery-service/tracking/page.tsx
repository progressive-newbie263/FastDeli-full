"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDeliveryAuth } from '../context/DeliveryAuthContext';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Package,
  RefreshCcw,
  Truck,
} from 'lucide-react';

const API_BASE = 'http://localhost:5002/api';
const STORAGE_KEY = 'delivery_active_shipment';

type ShipmentStatus = 'SEARCHING_DRIVER' | 'DRIVER_ACCEPTED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';

interface Shipment {
  id: number;
  status: ShipmentStatus;
  price: number;
  created_at?: string;
  item_type?: string;
  item_weight?: string;
  pickup_address?: string;
  dropoff_address?: string;
  driver_id?: number | null;
}

const shipmentDateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const formatShipmentDateTime = (value?: string) => {
  if (!value) {
    return 'Đang cập nhật';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Đang cập nhật';
  }

  return shipmentDateTimeFormatter.format(date);
};

const getStatusStep = (status: ShipmentStatus) => {
  switch (status) {
    case 'SEARCHING_DRIVER':
      return 1;
    case 'DRIVER_ACCEPTED':
      return 2;
    case 'PICKED_UP':
      return 3;
    case 'DELIVERED':
      return 4;
    default:
      return 0;
  }
};

const translateShipmentStatus = (status: ShipmentStatus) => {
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
      return status;
  }
};

export default function DeliveryTrackingPage() {
  const { currentUser, isAuthenticated, loading: authLoading } = useDeliveryAuth();
  const searchParams = useSearchParams();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shipmentId, setShipmentId] = useState<number | null>(null);
  const [trackingSource, setTrackingSource] = useState<'selected' | 'latest'>('selected');

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let ignore = false;

    const resolveInitialShipment = async () => {
      setLoading(true);
      setError('');

      const queryId = searchParams.get('id') || searchParams.get('orderId');
      if (queryId) {
        const parsed = Number(queryId);
        if (Number.isFinite(parsed)) {
          if (!ignore) {
            setTrackingSource('selected');
            setShipmentId(parsed);
          }
          return;
        }
      }

      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as Partial<Shipment>;
            if (typeof parsed.id === 'number') {
              if (!ignore) {
                setTrackingSource('selected');
                setShipment(parsed as Shipment);
                setShipmentId(parsed.id);
              }
              return;
            }
          } catch {
            // Fallback to latest shipment lookup below.
          }
        }
      }

      if (!currentUser?.user_id) {
        if (!ignore) {
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/shipments/history?user_id=${currentUser.user_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('delivery_token')}`,
          },
        });
        const data = await response.json();

        if (ignore) {
          return;
        }

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const latestShipment = data.data[0] as Shipment;
          setTrackingSource('latest');
          setShipment(latestShipment);
          setShipmentId(latestShipment.id);
          return;
        }

        setShipment(null);
        setShipmentId(null);
        setLoading(false);
        setError('Bạn chưa có đơn hàng nào để theo dõi.');
      } catch {
        if (!ignore) {
          setShipment(null);
          setShipmentId(null);
          setLoading(false);
          setError('Không thể tải đơn hàng gần nhất.');
        }
      }
    };

    void resolveInitialShipment();

    return () => {
      ignore = true;
    };
  }, [authLoading, isAuthenticated, currentUser, searchParams]);

  useEffect(() => {
    if (!shipmentId) {
      return;
    }

    let ignore = false;

    const fetchShipment = async () => {
      try {
        const response = await fetch(`${API_BASE}/shipments/${shipmentId}`);
        const data = await response.json();

        if (!ignore && data.success) {
          setShipment(data.data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data));
          setError('');
        } else if (!ignore) {
          setError(data.message || 'Không thể tải trạng thái đơn hàng.');
        }
      } catch (fetchError) {
        if (!ignore) {
          setError('Lỗi kết nối server.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void fetchShipment();

    const interval = window.setInterval(() => {
      void fetchShipment();
    }, 3000);

    return () => {
      ignore = true;
      window.clearInterval(interval);
    };
  }, [shipmentId]);

  const step = shipment ? getStatusStep(shipment.status) : 0;

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8fafc_45%,_#eef2ff_100%)]">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8fafc_45%,_#eef2ff_100%)] p-4">
        <div className="w-full max-w-md rounded-[2.5rem] border border-white bg-white/90 p-8 text-center shadow-2xl backdrop-blur">
          <Package className="mx-auto mb-4 h-14 w-14 text-slate-200" />
          <h1 className="mb-2 text-2xl font-semibold text-slate-900">Cần đăng nhập</h1>
          <p className="mb-8 font-medium text-slate-500">Vui lòng đăng nhập để theo dõi đơn hàng của bạn.</p>
          <Link href="/delivery-service/auth/login" className="block rounded-2xl bg-emerald-600 py-4 font-medium text-white shadow-lg shadow-emerald-200 transition-colors hover:bg-emerald-700">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8fafc_45%,_#eef2ff_100%)] px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-white bg-white/90 p-8 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-3 text-slate-400">
            <Clock size={18} />
            <span className="text-xs font-semibold tracking-normal">Theo dõi đơn hàng</span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Chưa có đơn đang theo dõi</h1>
          <p className="mt-3 max-w-xl text-slate-500">Hãy tạo một đơn mới hoặc mở lại từ lịch sử để xem tiến trình giao hàng.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/delivery-service" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 font-medium text-white shadow-lg shadow-emerald-200 transition-colors hover:bg-emerald-700">
              <ArrowLeft size={18} /> Về trang đặt hàng
            </Link>
            <Link href="/delivery-service/history" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 font-medium text-white transition-colors hover:bg-slate-800">
              <RefreshCcw size={18} /> Mở lịch sử
            </Link>
          </div>
          {error ? <p className="mt-6 text-sm font-medium text-rose-600">{error}</p> : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8fafc_45%,_#eef2ff_100%)] px-4 py-10 text-slate-900">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <section className="rounded-[2.5rem] border border-white bg-white/90 p-8 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-normal text-emerald-700">
                <Truck size={12} /> Đơn hàng #{shipment.id}
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-normal text-slate-900">Theo dõi trạng thái đơn hàng</h1>
              <p className="mt-2 text-slate-500">Cập nhật tự động mỗi vài giây để bạn nắm tiến trình giao hàng.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-normal text-emerald-700">
                  {trackingSource === 'latest' ? 'Đang theo dõi đơn gần nhất' : 'Đơn đang theo dõi'}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-normal text-slate-600">
                  Đặt lúc {formatShipmentDateTime(shipment.created_at)}
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-semibold tracking-normal text-emerald-700">
              {translateShipmentStatus(shipment.status)}
            </div>
          </div>

          <div className="mt-8 space-y-10 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-1 before:bg-slate-100">
            {[
              { title: 'Hệ thống tiếp nhận', description: 'Đã khớp lệnh thành công' },
              { title: 'Tài xế đang đến', description: 'Vui lòng chuẩn bị gói hàng' },
              { title: 'Đang giao hàng', description: 'Tài xế đang vận chuyển đến người nhận' },
              { title: 'Hoàn tất', description: 'Giao hàng thành công!' },
            ].map((item, index) => {
              const currentStep = index + 1;
              const isDone = step >= currentStep;

              return (
                <div key={item.title} className="relative flex items-center gap-6">
                  <div className={`z-10 flex h-6 w-6 items-center justify-center rounded-full transition-all ${isDone ? 'scale-125 bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-100'}`}>
                    {step > currentStep ? <CheckCircle2 size={16} className="text-white" /> : <div className={`h-2 w-2 rounded-full ${isDone ? 'bg-white' : 'bg-slate-300'}`} />}
                  </div>
                  <div className="space-y-0.5">
                    <p className={`text-lg font-semibold tracking-normal ${isDone ? 'text-slate-800' : 'text-slate-300'}`}>{item.title}</p>
                    <p className="text-xs font-medium text-slate-400">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 rounded-[1.75rem] border border-slate-100 bg-slate-50/70 p-5">
            <div className="flex items-center gap-3 text-slate-500">
              <MapPin size={16} className="text-emerald-500" />
              <span className="text-xs font-semibold tracking-normal">Điểm lấy hàng</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-700">{shipment.pickup_address || 'Đang cập nhật...'}</p>
            <div className="mt-4 flex items-center gap-3 text-slate-500">
              <MapPin size={16} className="text-rose-500" />
              <span className="text-xs font-semibold tracking-normal">Điểm giao hàng</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-700">{shipment.dropoff_address || 'Đang cập nhật...'}</p>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/40">
            <p className="text-[11px] font-semibold tracking-normal text-slate-400">Tóm tắt nhanh</p>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-semibold tracking-normal text-slate-400">Mã đơn</p>
                <p className="mt-1 text-xl font-semibold">#{shipment.id}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-semibold tracking-normal text-slate-400">Đặt lúc</p>
                <p className="mt-1 text-sm font-semibold leading-relaxed">{formatShipmentDateTime(shipment.created_at)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-semibold tracking-normal text-slate-400">Cước</p>
                  <p className="mt-1 text-xl font-semibold">{Number(shipment.price).toLocaleString()}đ</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-semibold tracking-normal text-slate-400">Trạng thái</p>
                  <p className="mt-1 text-xl font-semibold">{step}/4</p>
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 font-medium text-white transition-colors hover:bg-emerald-700"
              >
                <RefreshCcw size={16} /> Làm mới ngay
              </button>
              <p className="text-center text-[11px] font-semibold tracking-normal text-slate-400">
                {trackingSource === 'latest'
                  ? 'Tự động bám theo đơn mới nhất trong lịch sử.'
                  : 'Đang theo dõi đơn được chọn hoặc được lưu gần nhất.'}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}