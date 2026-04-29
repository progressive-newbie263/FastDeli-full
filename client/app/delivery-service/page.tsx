"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDeliveryAuth } from './context/DeliveryAuthContext';
import {
  Package,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  Truck,
  Box,
  Navigation,
  ArrowRight,
  Clock,
  LogIn,
  Loader2,
  History,
  Calculator,
} from 'lucide-react';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';

const API_BASE = 'http://localhost:5002/api';

const PRICING_CONFIG = {
  BASE_FEE: 15000,
  PER_KM_FEE: 5000,
  WEIGHT_SURCHARGES: {
    'Dưới 5kg': 0,
    '5kg - 10kg': 10000,
    'Trên 10kg': 25000,
  },
} as const;

const distanceFormatter = new Intl.NumberFormat('vi-VN', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const formatDistanceKm = (value: number) => distanceFormatter.format(value);

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
      return String(status).replace(/_/g, ' ');
  }
};

type ShipmentStatus = 'SEARCHING_DRIVER' | 'DRIVER_ACCEPTED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';

interface Shipment {
  id: number;
  status: ShipmentStatus;
  price: number;
  item_type: string;
  item_weight: string;
  driver_id?: number | null;
}

type GeocodeType = 'pickup' | 'dropoff';

export default function DeliveryServicePage() {
  const { currentUser, isAuthenticated, loading: authLoading } = useDeliveryAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Shipment | null>(null);
  const [pickupAddress, setPickupAddress] = useState('Đang xác định vị trí...');
  const [pickupCoords, setPickupCoords] = useState({ lat: 21.033347, lng: 105.782807 });
  const [dropoffAddress, setDropoffAddress] = useState('120 P.Yên Lãng, Thịnh Quang, Đống Đa, Hà Nội 100000, Vietnam');
  const [dropoffCoords, setDropoffCoords] = useState({ lat: 21.010117, lng: 105.815414 });
  const [isGeocoding, setIsGeocoding] = useState({ pickup: false, dropoff: false });
  const [manualCalculating, setManualCalculating] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [itemType, setItemType] = useState('Tài liệu');
  const [itemWeight, setItemWeight] = useState('Dưới 5kg');

  const pickupAddressManuallyEdited = useRef(false);
  const pickupGeocodeRequestId = useRef(0);

  const geocodeAddress = useCallback(async (address: string, type: GeocodeType) => {
    const trimmed = address.trim();
    if (!trimmed || trimmed.length < 5 || trimmed === 'Vị trí hiện tại của bạn' || trimmed === 'Đang xác định vị trí...') {
      return;
    }

    const requestId = type === 'pickup' ? ++pickupGeocodeRequestId.current : 0;
    setIsGeocoding((prev) => ({ ...prev, [type]: true }));

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=vi&q=${encodeURIComponent(trimmed)}`,
        {
          headers: { 'User-Agent': 'FastDeli/1.0' },
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        return;
      }

      const lat = Number(data[0]?.lat);
      const lon = Number(data[0]?.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return;
      }

      if (type === 'pickup') {
        if (requestId === pickupGeocodeRequestId.current) {
          setPickupCoords({ lat, lng: lon });
        }
      } else {
        setDropoffCoords({ lat, lng: lon });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsGeocoding((prev) => ({ ...prev, [type]: false }));
    }
  }, []);

  const debouncedGeocode = useMemo(
    () => debounce((value: string, type: GeocodeType) => void geocodeAddress(value, type), 600),
    [geocodeAddress]
  );

  useEffect(() => {
    return () => {
      debouncedGeocode.cancel();
    };
  }, [debouncedGeocode]);

  useEffect(() => {
    if (pickupAddress && pickupAddress !== 'Vị trí hiện tại của bạn' && pickupAddress !== 'Đang xác định vị trí...') {
      debouncedGeocode(pickupAddress, 'pickup');
    }
  }, [pickupAddress, debouncedGeocode]);

  useEffect(() => {
    if (dropoffAddress) {
      debouncedGeocode(dropoffAddress, 'dropoff');
    }
  }, [dropoffAddress, debouncedGeocode]);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      if (!pickupAddressManuallyEdited.current) {
        setPickupAddress('123 Lê Lợi, Quận 1, TP.HCM');
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (pickupAddressManuallyEdited.current) {
          return;
        }

        setPickupCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setPickupAddress('Vị trí hiện tại của bạn');
      },
      () => {
        if (!pickupAddressManuallyEdited.current) {
          setPickupAddress('123 Lê Lợi, Quận 1, TP.HCM');
        }
      }
    );
  }, []);

  useEffect(() => {
    if (currentUser) {
      setContactName(currentUser.full_name || '');
      setContactPhone(currentUser.phone_number || '');
    }
  }, [currentUser]);

  const { estimatedPrice, distance } = useMemo(() => {
    const deg2rad = (deg: number) => deg * (Math.PI / 180);
    const earthRadius = 6371;
    const dLat = deg2rad(dropoffCoords.lat - pickupCoords.lat);
    const dLon = deg2rad(dropoffCoords.lng - pickupCoords.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(pickupCoords.lat)) * Math.cos(deg2rad(dropoffCoords.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = earthRadius * c;

    let price = PRICING_CONFIG.BASE_FEE;
    if (dist > 2) {
      price += (dist - 2) * PRICING_CONFIG.PER_KM_FEE;
    }
    price += PRICING_CONFIG.WEIGHT_SURCHARGES[itemWeight as keyof typeof PRICING_CONFIG.WEIGHT_SURCHARGES] || 0;

    return {
      estimatedPrice: Math.ceil(price / 1000) * 1000,
      distance: dist,
    };
  }, [pickupCoords, dropoffCoords, itemWeight]);

  const estimatedMinutes = Math.max(15, Math.round(distance * 6 + 12));
  const formattedDistance = formatDistanceKm(distance);

  const handleManualCalculate = async () => {
    setManualCalculating(true);
    await Promise.all([
      geocodeAddress(pickupAddress, 'pickup'),
      geocodeAddress(dropoffAddress, 'dropoff'),
    ]);
    setManualCalculating(false);
    toast.info('Đã cập nhật giá cước mới nhất!');
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (order && order.status !== 'DELIVERED' && order.status !== 'CANCELLED') {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`${API_BASE}/shipments/${order.id}`);
          const data = await response.json();
          if (data.success) {
            setOrder(data.data);
            if (data.data.status === 'DELIVERED') {
              toast.success('Giao hàng thành công!');
              if (interval) {
                clearInterval(interval);
              }
            }
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 3000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [order]);

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.warn('Vui lòng đăng nhập để đặt giao hàng.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('delivery_token')}`,
        },
        body: JSON.stringify({
          user_id: currentUser?.user_id,
          pickup: {
            lat: pickupCoords.lat,
            lng: pickupCoords.lng,
            address: pickupAddress,
            contact_name: 'Người gửi',
            contact_phone: currentUser?.phone_number || '0000000000',
          },
          dropoff: {
            lat: dropoffCoords.lat,
            lng: dropoffCoords.lng,
            address: dropoffAddress,
            contact_name: contactName,
            contact_phone: contactPhone,
          },
          itemInfo: {
            type: itemType,
            weight: itemWeight,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
        localStorage.setItem('delivery_active_shipment', JSON.stringify(data.data));
        router.push(`/delivery-service/tracking?id=${data.data.id}`);
        toast.info('Đã đặt đơn! Đang tìm tài xế...');
      } else {
        toast.error(`Lỗi: ${data.message}`);
      }
    } catch (error) {
      toast.error('Lỗi kết nối server.');
    } finally {
      setLoading(false);
    }
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

  const step = order ? getStatusStep(order.status) : 0;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8fafc_45%,_#f1f5f9_100%)]">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <main className="relative min-h-[calc(100vh-64px)] overflow-hidden 
      bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8fafc_45%,_#eef2ff_100%)] 
      text-slate-900 pb-20 selection:bg-emerald-100
    ">
      <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl p-4 md:py-10">
        {!isAuthenticated ? (
          <div className="grid grid-cols-1 gap-10 py-6 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold tracking-normal text-emerald-700 shadow-lg shadow-emerald-100/70 backdrop-blur">
                <Package size={14} /> Dịch vụ giao hàng
              </div>
              <h1 className="max-w-xl text-5xl font-semibold leading-[0.95] tracking-normal text-slate-900 md:text-6xl">
                Vận chuyển <span className="italic text-emerald-600">siêu tốc</span> trong tầm tay.
              </h1>
              <p className="max-w-md text-lg leading-relaxed text-slate-600">
                Giao tài liệu, đồ ăn hay quà tặng chỉ trong 30 phút. An toàn, tin cậy và minh bạch.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/delivery-service/auth/register"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-8 py-4 font-medium text-white shadow-xl shadow-slate-200 transition-all hover:bg-slate-800"
                >
                  Bắt đầu ngay <ArrowRight size={20} />
                </Link>
                <Link
                  href="/delivery-service/auth/login"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white bg-white/80 px-8 py-4 font-medium text-slate-700 shadow-lg shadow-slate-200/60 backdrop-blur transition-all hover:bg-white"
                >
                  Đăng nhập <LogIn size={20} />
                </Link>
              </div>

              <div className="grid max-w-2xl grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white bg-white/75 p-5 shadow-lg shadow-slate-200/60 backdrop-blur">
                  <p className="mb-2 text-[11px] font-semibold tracking-normal text-slate-400">Thời gian trung bình</p>
                  <p className="text-3xl font-semibold text-slate-900">30m</p>
                </div>
                <div className="rounded-3xl border border-white bg-white/75 p-5 shadow-lg shadow-slate-200/60 backdrop-blur">
                  <p className="mb-2 text-[11px] font-semibold tracking-normal text-slate-400">Tài xế</p>
                  <p className="text-3xl font-semibold text-slate-900">5k+</p>
                </div>
                <div className="rounded-3xl border border-white bg-white/75 p-5 shadow-lg shadow-slate-200/60 backdrop-blur">
                  <p className="mb-2 text-[11px] font-semibold tracking-normal text-slate-400">Bảo hiểm</p>
                  <p className="text-3xl font-semibold text-slate-900">100%</p>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 rounded-[3rem] bg-emerald-200/40 blur-3xl opacity-70 transition-opacity group-hover:opacity-100" />
              <div className="relative rounded-[2.5rem] border border-white bg-white/90 p-6 shadow-2xl backdrop-blur">
                <img
                  src="https://img.freepik.com/premium-photo/courier-delivering-packages-scooter-city-modern-delivery-service-concept-generative-ai_103070-3494.jpg"
                  alt="Express Delivery"
                  className="h-[400px] w-full rounded-3xl object-cover"
                />
                <div className="mt-4 flex justify-start">
                  <div className="flex max-w-[260px] items-center gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 />
                    </div>
                    <p className="text-xs font-semibold leading-relaxed text-slate-700">
                      Giá cước rẻ nhất thị trường
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : !order ? (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,#047857_0%,#10b981_54%,#14b8a6_100%)] p-8 text-white shadow-2xl shadow-emerald-200/50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.45),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.25),transparent_28%)] opacity-30" />
                <div className="relative z-10 flex flex-col gap-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="max-w-xl space-y-3">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold tracking-normal backdrop-blur">
                        <Package size={12} /> Giao hàng hoả tốc 24/7
                      </div>
                      <h2 className="text-3xl font-semibold leading-tight tracking-normal md:text-4xl">
                        Chào {currentUser?.full_name?.split(' ').pop()}!
                      </h2>
                      <p className="max-w-2xl text-sm font-medium leading-relaxed text-emerald-50/85 md:text-base">
                        Địa chỉ lấy hàng, điểm giao hàng, và cước phí được gom vào một màn hình để bạn kiểm soát nhanh hơn.
                      </p>
                    </div>
                    <Link
                      href="/delivery-service/history"
                      className="shrink-0 rounded-2xl bg-white/15 px-4 py-3 text-sm font-medium backdrop-blur transition-all hover:bg-white/25 flex items-center gap-2"
                    >
                      <History size={18} /> Lịch sử
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-white/12 p-4 backdrop-blur">
                      <p className="mb-2 text-[11px] font-semibold tracking-normal text-emerald-50/75">Khoảng cách</p>
                      <div className="flex items-end gap-2">
                        <p className="text-3xl font-semibold leading-none">{formattedDistance}</p>
                        <span className="pb-1 text-sm font-semibold text-emerald-50/80">km</span>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/12 p-4 backdrop-blur">
                      <p className="mb-2 text-[11px] font-semibold tracking-normal text-emerald-50/75">Thời gian</p>
                      <p className="text-3xl font-semibold">{estimatedMinutes} phút</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/12 p-4 backdrop-blur">
                      <p className="mb-2 text-[11px] font-semibold tracking-normal text-emerald-50/75">Trạng thái</p>
                      <p className="text-3xl font-semibold">Sẵn sàng</p>
                    </div>
                  </div>
                </div>
                <Truck size={180} className="absolute -bottom-10 -right-8 text-white/10" />
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-white bg-white/90 shadow-xl shadow-slate-200/50 backdrop-blur">
                <div className="space-y-8 p-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex flex-col items-center">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-emerald-500 bg-white">
                          <div className={`h-2 w-2 rounded-full ${isGeocoding.pickup ? 'animate-ping bg-emerald-500' : 'bg-emerald-500'}`} />
                        </div>
                        <div className="h-16 w-0.5 bg-slate-100" />
                      </div>
                      <div className="group flex-1">
                        <label className="mb-1.5 block text-[11px] font-semibold tracking-normal text-slate-400">
                          Địa chỉ gửi hàng
                        </label>
                        
                        <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 shadow-sm transition-all focus-within:border-emerald-500 focus-within:bg-white">
                          <input
                            value={pickupAddress}
                            onChange={(event) => {
                              pickupAddressManuallyEdited.current = true;
                              setPickupAddress(event.target.value);
                            }}
                            onFocus={() => {
                              pickupAddressManuallyEdited.current = true;
                              if (pickupAddress === 'Vị trí hiện tại của bạn') {
                                setPickupAddress('');
                              }
                            }}
                            placeholder="Nhập địa chỉ lấy hàng..."
                            className="w-full bg-transparent text-lg font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none"
                          />
                          {isGeocoding.pickup && <Loader2 size={16} className="animate-spin text-emerald-500" />}
                        </div>
                        <p className="mt-2 text-[11px] font-medium text-slate-400">Đổi địa chỉ rồi chờ vài giây để hệ thống tính lại khoảng cách.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <MapPin className={`${isGeocoding.dropoff ? 'animate-bounce text-rose-500' : 'text-rose-500'}`} size={26} fill="currentColor" fillOpacity={0.2} />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1.5 block text-[11px] font-semibold tracking-normal text-slate-400">
                          Địa chỉ nhận hàng
                        </label>
                        <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 shadow-sm transition-all focus-within:border-rose-500 focus-within:bg-white">
                          <input
                            value={dropoffAddress}
                            onChange={(event) => setDropoffAddress(event.target.value)}
                            placeholder="Nhập địa chỉ giao hàng..."
                            className="w-full bg-transparent text-lg font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none"
                          />
                          {isGeocoding.dropoff && <Loader2 size={16} className="animate-spin text-rose-500" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[11px] font-semibold tracking-normal text-slate-500">
                        <User size={14} className="text-emerald-500" /> Tên người nhận
                      </label>
                      <input
                        value={contactName}
                        onChange={(event) => setContactName(event.target.value)}
                        placeholder="Người nhận hàng"
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3.5 text-sm font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[11px] font-semibold tracking-normal text-slate-500">
                        <Phone size={14} className="text-emerald-500" /> Số điện thoại
                      </label>
                      <input
                        value={contactPhone}
                        onChange={(event) => setContactPhone(event.target.value)}
                        placeholder="09xx xxx xxx"
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3.5 text-sm font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[11px] font-semibold tracking-normal text-slate-500">
                        <Box size={14} className="text-emerald-500" /> Loại hàng hóa
                      </label>
                      <select
                        value={itemType}
                        onChange={(event) => setItemType(event.target.value)}
                        className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3.5 text-sm font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      >
                        <option>Tài liệu</option>
                        <option>Thực phẩm</option>
                        <option>Hàng gia dụng</option>
                        <option>Điện tử</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[11px] font-semibold tracking-normal text-slate-500">
                        <Clock size={14} className="text-emerald-500" /> Khối lượng
                      </label>
                      <select
                        value={itemWeight}
                        onChange={(event) => setItemWeight(event.target.value)}
                        className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3.5 text-sm font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      >
                        <option>Dưới 5kg</option>
                        <option>5kg - 10kg</option>
                        <option>Trên 10kg</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/70 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex w-full items-center gap-5 sm:w-auto">
                    <div>
                      <p className="mb-1 text-[11px] font-semibold tracking-normal text-slate-400">Cước phí ước tính</p>
                      <p className="text-3xl font-semibold italic text-slate-900">{estimatedPrice.toLocaleString()}đ</p>
                    </div>
                    <button
                      onClick={handleManualCalculate}
                      className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-3 text-xs font-semibold tracking-normal text-emerald-600 shadow-sm transition-colors hover:bg-emerald-50"
                    >
                      <Calculator size={16} /> Tính giá mới
                    </button>
                  </div>
                  <button
                    onClick={handleBooking}
                    disabled={loading || manualCalculating}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-10 py-4 text-sm font-semibold tracking-normal text-white shadow-xl shadow-emerald-200 transition-all hover:bg-emerald-700 disabled:opacity-50 sm:w-auto"
                  >
                    {loading ? 'Đang xử lý...' : 'Đặt giao ngay'}
                    {!loading && <ArrowRight size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-6">
              <div className="rounded-[2rem] border border-slate-800/60 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/40">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold tracking-normal text-slate-400">Tóm tắt nhanh</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-normal">Sẵn sàng đặt đơn</h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
                    <Navigation size={22} />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="mb-2 text-[11px] font-semibold tracking-normal text-slate-400">Khoảng cách</p>
                    <div className="flex items-end gap-1.5">
                      <p className="text-2xl font-semibold leading-none">{formattedDistance}</p>
                      <span className="pb-0.5 text-sm font-semibold text-white/70">km</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="mb-2 text-[11px] font-semibold tracking-normal text-slate-400">Thời gian dự kiến</p>
                    <p className="text-2xl font-semibold">{estimatedMinutes} phút</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-5 sm:col-span-3 lg:col-span-1">
                    <p className="mb-2 text-[11px] font-semibold tracking-normal text-emerald-200">Cước phí ước tính</p>
                    <p className="text-4xl font-semibold italic">{estimatedPrice.toLocaleString()}đ</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-10 rounded-[2.5rem] border border-slate-50 bg-white p-10 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="flex items-center gap-3 text-2xl font-semibold text-slate-800">
                  <Package className="text-emerald-500" size={28} /> Đơn hàng #{order.id}
                </h3>
                <p className="text-sm font-semibold tracking-normal text-slate-400">Giao hàng đang được thực hiện</p>
              </div>
              <div className="rounded-full border border-emerald-100 bg-emerald-50 px-5 py-2 text-xs font-semibold tracking-normal text-emerald-600">
                {translateShipmentStatus(order.status)}
              </div>
            </div>

            <div className="relative space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-1 before:bg-slate-50 before:content-['']">
              <div className="relative flex items-center gap-6">
                <div className={`z-10 flex h-6 w-6 items-center justify-center rounded-full transition-all ${step >= 1 ? 'scale-125 bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-100'}`}>
                  {step > 1 ? <CheckCircle2 size={16} className="text-white" /> : <div className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-white' : 'bg-slate-300'}`} />}
                </div>
                <div className="space-y-0.5">
                  <p className={`text-lg font-semibold tracking-normal ${step >= 1 ? 'text-slate-800' : 'text-slate-300'}`}>Hệ thống tiếp nhận</p>
                  <p className="text-xs font-medium text-slate-400">Đã khớp lệnh thành công</p>
                </div>
              </div>

              <div className="relative flex items-center gap-6">
                <div className={`z-10 flex h-6 w-6 items-center justify-center rounded-full transition-all ${step >= 2 ? 'scale-125 bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-100'}`}>
                  {step > 2 ? <CheckCircle2 size={16} className="text-white" /> : <div className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-white' : 'bg-slate-300'}`} />}
                </div>
                <div className="space-y-0.5">
                  <p className={`text-lg font-semibold tracking-normal ${step >= 2 ? 'text-slate-800' : 'text-slate-300'}`}>Tài xế đang đến</p>
                  <p className="text-xs font-medium text-slate-400">Vui lòng chuẩn bị gói hàng</p>
                </div>
              </div>

              <div className="relative flex items-center gap-6">
                <div className={`z-10 flex h-6 w-6 items-center justify-center rounded-full transition-all ${step >= 3 ? 'scale-125 bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-100'}`}>
                  {step > 3 ? <CheckCircle2 size={16} className="text-white" /> : <div className={`h-2 w-2 rounded-full ${step >= 3 ? 'bg-white' : 'bg-slate-300'}`} />}
                </div>
                <div className="space-y-0.5">
                  <p className={`text-lg font-semibold tracking-normal ${step >= 3 ? 'text-slate-800' : 'text-slate-300'}`}>Đang giao hàng</p>
                  <p className="text-xs font-medium text-slate-400">Tài xế đang vận chuyển đến người nhận</p>
                </div>
              </div>

              <div className="relative flex items-center gap-6">
                <div className={`z-10 flex h-6 w-6 items-center justify-center rounded-full transition-all ${step >= 4 ? 'scale-150 bg-emerald-500 shadow-xl shadow-emerald-200' : 'bg-slate-100'}`}>
                  {step >= 4 ? <CheckCircle2 size={16} className="text-white" /> : <div className={`h-2 w-2 rounded-full ${step >= 4 ? 'bg-white' : 'bg-slate-300'}`} />}
                </div>
                <div className="space-y-0.5">
                  <p className={`text-lg font-semibold tracking-normal ${step >= 4 ? 'text-emerald-600' : 'text-slate-300'}`}>Hoàn tất</p>
                  <p className="text-xs font-medium text-slate-400">Giao hàng thành công!</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 border-t border-slate-50 pt-10">
              <button
                onClick={() => setOrder(null)}
                className="w-full rounded-2xl py-4 text-sm font-semibold tracking-normal text-slate-400 transition-all hover:bg-emerald-50 hover:text-emerald-600"
              >
                Gửi thêm đơn hàng khác
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
