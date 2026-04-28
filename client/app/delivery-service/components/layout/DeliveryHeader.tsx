"use client";

import Link from 'next/link';
import { useDeliveryAuth } from '../../context/DeliveryAuthContext';
import { Package, LogOut, User, LogIn, UserPlus } from 'lucide-react';

export default function DeliveryHeader() {
  const { currentUser, isAuthenticated, logout } = useDeliveryAuth();

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/delivery-service" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Package size={24} />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            ExpressDeli
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                <img 
                  src={currentUser?.avatar_url || "https://ui-avatars.com/api/?name=" + currentUser?.full_name} 
                  className="w-6 h-6 rounded-full" 
                  alt="Avatar" 
                />
                <span className="text-sm font-semibold text-slate-700">{currentUser?.full_name}</span>
              </div>
              <button 
                onClick={logout}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-full transition-colors"
                title="Đăng xuất"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/delivery-service/auth/login"
                className="text-sm font-bold text-slate-600 hover:text-emerald-600 px-4 py-2 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link 
                href="/delivery-service/auth/register"
                className="text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl shadow-md shadow-emerald-100 transition-all active:scale-95"
              >
                Bắt đầu ngay
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
