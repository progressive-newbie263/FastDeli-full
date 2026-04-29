"use client";

import Link from 'next/link';
import { useDeliveryAuth } from '../../context/DeliveryAuthContext';
import { Package, LogOut } from 'lucide-react';
import DeliveryServiceNav from './DeliveryServiceNav';

export default function DeliveryHeader() {
  const { currentUser, isAuthenticated, logout } = useDeliveryAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-3 md:px-4">
        <div className="flex items-center gap-3 py-2.5 md:py-3">
          <Link href="/delivery-service" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <Package size={22} />
            </div>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-lg font-semibold tracking-normal text-transparent md:text-xl">
              ExpressDeli
            </span>
          </Link>

          <div className="flex flex-1 justify-center px-1">
            <DeliveryServiceNav />
          </div>

          <nav className="flex items-center gap-4 md:gap-6">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1.25 md:px-3 md:py-1.5">
                  <img
                    src={currentUser?.avatar_url || "https://ui-avatars.com/api/?name=" + currentUser?.full_name}
                    className="h-5 w-5 rounded-full md:h-6 md:w-6"
                    alt="Avatar"
                  />
                  <span className="text-sm font-medium tracking-normal text-slate-700">{currentUser?.full_name}</span>
                </div>
                <button
                  onClick={logout}
                  className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 md:p-2"
                  title="Đăng xuất"
                >
                  <LogOut size={18} className="md:h-5 md:w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-3">
                <Link
                  href="/delivery-service/auth/login"
                  className="px-3 py-1.5 text-sm font-medium tracking-normal text-slate-600 transition-colors hover:text-emerald-600 md:px-4 md:py-2"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/delivery-service/auth/register"
                  className="rounded-xl bg-emerald-600 px-4 py-1.5 text-sm font-medium tracking-normal text-white shadow-md shadow-emerald-100 transition-all hover:bg-emerald-700 active:scale-95 md:px-5 md:py-2"
                >
                  Bắt đầu ngay
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
