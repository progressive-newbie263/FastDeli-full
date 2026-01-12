'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSupplierAuth } from '../contexts/SupplierAuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Settings,
  LogOut,
  Store,
  Menu,
  X,
  Bell,
} from 'lucide-react';

export default function SupplierHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, restaurant, logout } = useSupplierAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [pendingOrders, setPendingOrders] = React.useState(8); // Mock pending orders

  React.useEffect(() => {
    // Simulate real-time order updates
    const interval = setInterval(() => {
      setPendingOrders(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { href: '/supplier/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
    { href: '/supplier/orders', icon: ShoppingBag, label: 'Đơn hàng', badge: pendingOrders },
    { href: '/supplier/menu', icon: UtensilsCrossed, label: 'Thực đơn' },
    { href: '/supplier/settings', icon: Settings, label: 'Cài đặt' },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    logout();
    router.push('/supplier/login');
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Restaurant name */}
          <Link href="/supplier/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-xl shadow-sm">
              <Store className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">FastDeli</h1>
              <p className="text-xs text-gray-500 -mt-0.5">Supplier Portal</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const hasBadge = item.badge && item.badge > 0;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-orange-50 text-orange-600 shadow-sm font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-sm">{item.label}</span>
                  {hasBadge && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
              <Bell size={20} />
              {pendingOrders > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* User info */}
            {user && (
              <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-orange-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold shadow-sm">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'R'}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 max-w-[120px] truncate">
                    {restaurant?.name || user.full_name}
                  </span>
                  <span className="text-xs text-gray-500">Chủ nhà hàng</span>
                </div>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-200 shadow-lg bg-white">
            {/* User Info Mobile */}
            {user && (
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg mb-3">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'R'}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{restaurant?.name || user.full_name}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
              </div>
            )}

            {/* Nav Items */}
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const hasBadge = item.badge && item.badge > 0;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`relative flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-orange-50 text-orange-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </div>
                    {hasBadge && (
                      <span className="h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Logout Mobile */}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2"
              >
                <LogOut size={20} />
                <span>Đăng xuất</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
