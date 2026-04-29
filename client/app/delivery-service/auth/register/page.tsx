"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDeliveryAuth } from '../../context/DeliveryAuthContext';
import { Package, Mail, Lock, User, Phone, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  
  const { register } = useDeliveryAuth();
  const router = useRouter();

  const handleRegister = async (confirmJoin = false) => {
    setLoading(true);
    const res = await register({ ...formData, confirmJoin });
    
    if (res.success) {
      toast.success(confirmJoin ? "Đã kết nối tài khoản thành công!" : "Đăng ký thành công!");
      router.push('/delivery-service');
    } else if (res.requireConfirmation) {
      setConfirmMessage(res.error || '');
      setShowConfirmModal(true);
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRegister(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 space-y-8 relative overflow-hidden">
        
        {/* Progress bar simulation for aesthetic */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-50">
          <div className="h-full bg-emerald-500 w-1/3"></div>
        </div>

        <div className="text-center space-y-2 pt-2">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={32} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800">Đăng ký tài khoản giao hàng</h1>
          <p className="text-slate-500 text-sm">Vui lòng điền thông tin để tạo tài khoản và sử dụng dịch vụ.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="ml-1 text-xs font-medium tracking-[0.08em] text-slate-500">Họ và tên</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text" required
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 
                  focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm text-gray-800
                  "
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="ml-1 text-xs font-medium tracking-[0.08em] text-slate-500">Số điện thoại</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Phone size={18} />
                </div>
                <input 
                  type="tel" required
                  value={formData.phone_number}
                  onChange={e => setFormData({...formData, phone_number: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 
                    focus:border-emerald-500 transition-all text-sm text-gray-800
                  "
                  placeholder="0912 345 678"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-xs font-medium tracking-[0.08em] text-slate-500">Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                <Mail size={18} />
              </div>
              <input 
                type="email" required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 
                focus:border-emerald-500 transition-all text-sm text-gray-800
                "
                placeholder="ten@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-xs font-medium tracking-[0.08em] text-slate-500">Mật khẩu</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                <Lock size={18} />
              </div>
              <input 
                type="password" required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 
                focus:border-emerald-500 transition-all text-sm text-gray-800
                "
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Tạo tài khoản"}
            {!loading && <CheckCircle2 size={20} />}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-sm text-slate-500">
            Đã có tài khoản?{" "}
            <Link href="/delivery-service/auth/login" className="text-emerald-600 font-medium hover:underline underline-offset-4">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl space-y-6 animate-scaleUp">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-slate-800">Tài khoản đã tồn tại</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{confirmMessage}</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors"
              >
                Đóng
              </button>
              <button 
                onClick={() => handleRegister(true)}
                disabled={loading}
                className="flex-1 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Liên kết tài khoản"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
