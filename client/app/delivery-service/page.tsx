"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  ChevronLeft,
  AlertCircle,
  LogIn,
  UserPlus,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_BASE = "http://localhost:5002/api";

type ShipmentStatus = 'SEARCHING_DRIVER' | 'DRIVER_ACCEPTED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';

interface Shipment {
  id: number;
  status: ShipmentStatus;
  price: number;
  item_type: string;
  item_weight: string;
  driver_id?: number | null;
}

export default function DeliveryServicePage() {
  const { currentUser, isAuthenticated, loading: authLoading } = useDeliveryAuth();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Shipment | null>(null);
  
  // Form States
  const [pickupAddress, setPickupAddress] = useState("123 Lê Lợi, Quận 1, TP.HCM");
  const [dropoffAddress, setDropoffAddress] = useState("456 Cách Mạng Tháng 8, Quận 10, TP.HCM");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [itemType, setItemType] = useState("Tài liệu");
  const [itemWeight, setItemWeight] = useState("Dưới 5kg");

  // Pre-fill user data
  useEffect(() => {
    if (currentUser) {
      setContactName(currentUser.full_name || "");
      setContactPhone(currentUser.phone_number || "");
    }
  }, [currentUser]);

  // Polling logic remains the same...
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (order && order.status !== 'DELIVERED' && order.status !== 'CANCELLED') {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/shipments/${order.id}`);
          const data = await res.json();
          if (data.success) {
            setOrder(data.data);
            if (data.data.status === 'DELIVERED') {
              toast.success("Giao hàng thành công!");
              clearInterval(interval);
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [order]);

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.warn("Vui lòng đăng nhập để đặt giao hàng.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/shipments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser?.user_id,
          pickup: {
            lat: 10.762622, lng: 106.660172,
            address: pickupAddress,
            contact_name: "Người gửi", contact_phone: "0000000000"
          },
          dropoff: {
            lat: 10.772622, lng: 106.670172,
            address: dropoffAddress,
            contact_name: contactName, contact_phone: contactPhone
          },
          itemInfo: {
            type: itemType,
            weight: itemWeight
          }
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
        toast.info("Đã đặt đơn! Đang tìm tài xế...");
      } else {
        toast.error("Lỗi: " + data.message);
      }
    } catch (err: any) {
      toast.error("Lỗi kết nối server.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: ShipmentStatus) => {
    switch (status) {
      case 'SEARCHING_DRIVER': return 1;
      case 'DRIVER_ACCEPTED': return 2;
      case 'PICKED_UP': return 3;
      case 'DELIVERED': return 4;
      default: return 0;
    }
  };

  const step = order ? getStatusStep(order.status) : 0;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 text-slate-900 pb-20 font-sans">
      
      <div className="max-w-4xl mx-auto p-4 md:py-12">
        {!isAuthenticated ? (
          /* Guest Hero Section */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest">
                <Package size={14} /> Giao hàng hoả tốc 24/7
              </div>
              <h1 className="text-5xl font-black text-slate-800 leading-tight">
                Vận chuyển <span className="text-emerald-600 italic">siêu tốc</span> trong tầm tay.
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed max-w-md">
                Giao tài liệu, đồ ăn hay quà tặng chỉ trong 30 phút. An toàn, tin cậy và minh bạch.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/delivery-service/auth/register"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                >
                  Bắt đầu ngay <ArrowRight size={20} />
                </Link>
                <Link 
                  href="/delivery-service/auth/login"
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  Đăng nhập <LogIn size={20} />
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-4">
                <div>
                  <p className="text-2xl font-black text-slate-800">30m</p>
                  <p className="text-xs font-bold text-slate-400 uppercase">Thời gian TB</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">5k+</p>
                  <p className="text-xs font-bold text-slate-400 uppercase">Tài xế</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">100%</p>
                  <p className="text-xs font-bold text-slate-400 uppercase">Bảo hiểm</p>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-emerald-100 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-white p-6 rounded-[2.5rem] shadow-2xl border border-emerald-50">
                <img 
                  src="https://img.freepik.com/premium-photo/courier-delivering-packages-scooter-city-modern-delivery-service-concept-generative-ai_103070-3494.jpg" 
                  alt="Express Delivery"
                  className="rounded-3xl w-full h-[400px] object-cover"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border flex items-center gap-4 max-w-[200px]">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <CheckCircle2 />
                  </div>
                  <p className="text-xs font-bold text-slate-700">Giá cước rẻ nhất thị trường</p>
                </div>
              </div>
            </div>
          </div>
        ) : !order ? (
          /* Authenticated Booking Form (Centeread for visual balance) */
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-emerald-600 rounded-3xl p-8 text-white overflow-hidden relative shadow-2xl">
              <div className="relative z-10">
                <h2 className="text-3xl font-black mb-2">Chào {currentUser?.full_name?.split(' ').pop()}!</h2>
                <p className="text-emerald-100/80 text-sm font-medium">Bạn muốn gửi gì hôm nay? Chúng tôi có mặt ngay ở đây.</p>
              </div>
              <Truck size={150} className="absolute -bottom-8 -right-8 text-emerald-400/20" />
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="p-8 space-y-8">
                
                {/* Locations */}
                <div className="space-y-6 relative">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full border-[3px] border-emerald-500 bg-white flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      </div>
                      <div className="w-0.5 h-16 bg-slate-100"></div>
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 block">Điểm lấy hàng</label>
                      <input 
                        value={pickupAddress}
                        onChange={e => setPickupAddress(e.target.value)}
                        className="w-full text-lg text-slate-700 font-bold focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <MapPin className="text-rose-500" size={26} fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 block">Điểm giao hàng</label>
                      <input 
                        value={dropoffAddress}
                        onChange={e => setDropoffAddress(e.target.value)}
                        className="w-full text-lg text-slate-700 font-bold focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-50" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">
                      <User size={14} className="text-emerald-500" /> Tên người nhận
                    </label>
                    <input 
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder="Người nhận hàng"
                      className="w-full bg-slate-50/80 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">
                      <Phone size={14} className="text-emerald-500" /> Số điện thoại
                    </label>
                    <input 
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      placeholder="09xx xxx xxx"
                      className="w-full bg-slate-50/80 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">
                      <Box size={14} className="text-emerald-500" /> Loại hàng hóa
                    </label>
                    <select 
                      value={itemType}
                      onChange={e => setItemType(e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none appearance-none"
                    >
                      <option>Tài liệu</option>
                      <option>Thực phẩm</option>
                      <option>Hàng gia dụng</option>
                      <option>Điện tử</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">
                      <Clock size={14} className="text-emerald-500" /> Khối lượng
                    </label>
                    <select 
                      value={itemWeight}
                      onChange={e => setItemWeight(e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none appearance-none"
                    >
                      <option>Dưới 5kg</option>
                      <option>5kg - 10kg</option>
                      <option>Trên 10kg</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Price & Book */}
              <div className="p-8 bg-slate-50/50 flex items-center justify-between border-t border-slate-50">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Cước phí ước tính</p>
                  <p className="text-3xl font-black text-slate-800 italic">45.000đ</p>
                </div>
                <button 
                  onClick={handleBooking}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-3 uppercase tracking-wider text-sm"
                >
                  {loading ? "Đang xử lý..." : "Đặt giao ngay"}
                  {!loading && <ArrowRight size={20} />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Tracking View (same as before but integrated) */
          <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-50 p-10 animate-fadeIn space-y-10 group">
             <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <Package className="text-emerald-500" size={28} /> Đơn hàng #{order.id}
                </h3>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Giao hàng đang được thực hiện</p>
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
                {order.status.replace('_', ' ')}
              </div>
            </div>

            {/* Status Timeline ... */}
            <div className="space-y-12 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-1 before:bg-slate-50 group-hover:before:bg-emerald-50 transition-colors">
              <div className="flex items-center gap-6 relative">
                <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${step >= 1 ? 'bg-emerald-500 scale-125 shadow-lg shadow-emerald-200' : 'bg-slate-100'}`}>
                  {step > 1 ? <CheckCircle2 size={16} className="text-white" /> : <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-white' : 'bg-slate-300'}`}></div>}
                </div>
                <div className="space-y-0.5">
                  <p className={`text-lg font-black tracking-tight transition-colors ${step >= 1 ? 'text-slate-800' : 'text-slate-300'}`}>Hệ thống tiếp nhận</p>
                  <p className="text-xs font-bold text-slate-400">Đã khớp lệnh thành công</p>
                </div>
              </div>

              <div className="flex items-center gap-6 relative">
                <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${step >= 2 ? 'bg-emerald-500 scale-125 shadow-lg shadow-emerald-200' : 'bg-slate-100'}`}>
                  {step > 2 ? <CheckCircle2 size={16} className="text-white" /> : <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-white' : 'bg-slate-300'}`}></div>}
                </div>
                <div className="space-y-0.5">
                  <p className={`text-lg font-black tracking-tight transition-colors ${step >= 2 ? 'text-slate-800' : 'text-slate-300'}`}>Xác nhận tài xế</p>
                  <p className="text-xs font-bold text-slate-400">Tài xế Hoàng Nam (Mô phỏng) đang đến</p>
                </div>
              </div>

              <div className="flex items-center gap-6 relative">
                <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${step >= 3 ? 'bg-emerald-500 scale-125 shadow-lg shadow-emerald-200' : 'bg-slate-100'}`}>
                  {step > 3 ? <CheckCircle2 size={16} className="text-white" /> : <div className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-white' : 'bg-slate-300'}`}></div>}
                </div>
                <div className="space-y-0.5">
                  <p className={`text-lg font-black tracking-tight transition-colors ${step >= 3 ? 'text-slate-800' : 'text-slate-300'}`}>Đang trên đường</p>
                  <p className="text-xs font-bold text-slate-400">Đơn hàng đang cách bạn 2.4km</p>
                </div>
              </div>

              <div className="flex items-center gap-6 relative">
                <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${step >= 4 ? 'bg-emerald-500 scale-150 shadow-xl shadow-emerald-200' : 'bg-slate-100'}`}>
                  {step >= 4 ? <CheckCircle2 size={16} className="text-white" /> : <div className={`w-2 h-2 rounded-full ${step >= 4 ? 'bg-white' : 'bg-slate-300'}`}></div>}
                </div>
                <div className="space-y-0.5">
                  <p className={`text-lg font-black tracking-tight transition-colors ${step >= 4 ? 'text-emerald-600' : 'text-slate-300'}`}>Giao hàng thành công</p>
                  <p className="text-xs font-bold text-slate-400">Cảm ơn bạn đã tin dùng ExpressDeli!</p>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-50 flex flex-col gap-6">
               <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="w-16 h-16 bg-emerald-100 rounded-[1.25rem] flex items-center justify-center">
                     <Truck className="text-emerald-600" size={32} />
                  </div>
                  <div className="flex-1">
                     <p className="text-lg font-black text-slate-800 tracking-tight">Hoàng Nam (Mô phỏng)</p>
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-slate-200 px-2 py-0.5 rounded uppercase">59-X3 123.45</span>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">Yamaha Exciter</span>
                     </div>
                  </div>
                  <button className="bg-white border w-12 h-12 shadow-sm flex items-center justify-center rounded-2xl text-emerald-600 active:scale-95 transition-transform">
                     <Phone size={24} />
                  </button>
               </div>

               <button 
                onClick={() => setOrder(null)}
                className="w-full py-4 text-slate-400 font-black text-sm uppercase tracking-[0.2em] hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
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
