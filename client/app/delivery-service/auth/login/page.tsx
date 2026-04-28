"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDeliveryAuth } from '../../context/DeliveryAuthContext';
import { Package, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useDeliveryAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login({ email, password });
    if (res.success) {
      router.push('/delivery-service');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Chào mừng trở lại</h1>
          <p className="text-slate-500">Đăng nhập để bắt đầu giao hàng cùng ExpressDeli</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-800
                  "
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Mật khẩu</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 
                    focus:border-emerald-500 transition-all text-gray-800
                  "
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Đăng nhập"}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-500">
            Chưa có tài khoản?{" "}
            <Link href="/delivery-service/auth/register" className="text-emerald-600 font-bold hover:underline underline-offset-4">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
