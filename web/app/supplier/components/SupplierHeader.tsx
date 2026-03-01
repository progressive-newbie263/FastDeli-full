'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSupplierAuth } from '../contexts/SupplierAuthContext';
import SupplierAPI from '../lib/api';
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
  BarChart3,
  Star,
  User,
} from 'lucide-react';

export default function SupplierHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, restaurant, logout } = useSupplierAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [pendingOrders, setPendingOrders] = React.useState(0);

  // Fetch real pending orders count from API
  React.useEffect(() => {
    const fetchPendingOrders = async () => {
      if (!restaurant?.id) return;
      
      try {
        const response = await SupplierAPI.getStatistics(restaurant.id);
        if (response.success && response.data) {
          setPendingOrders(response.data.orders.pending_orders || 0);
        }
      } catch (error) {
        console.error('Failed to fetch pending orders:', error);
      }
    };

    fetchPendingOrders();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingOrders, 30000);
    return () => clearInterval(interval);
  }, [restaurant?.id]);

  const navItems = [
    { id: 'dashboard', href: '/supplier/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
    { id: 'orders', href: '/supplier/orders', icon: ShoppingBag, label: 'Đơn hàng', badge: pendingOrders },
    { id: 'menu', href: '/supplier/menu', icon: UtensilsCrossed, label: 'Thực đơn' },
    { id: 'analytics', href: '/supplier/analytics', icon: BarChart3, label: 'Phân tích' },
    { id: 'reviews', href: '/supplier/reviews', icon: Star, label: 'Đánh giá' },
    { id: 'profile', href: '/supplier/profile', icon: User, label: 'Hồ sơ' },
    { id: 'settings', href: '/supplier/settings', icon: Settings, label: 'Cài đặt' },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    logout();
    router.push('/supplier/login');
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Restaurant name */}
          <Link href="/supplier/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity flex-shrink-0">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-xl shadow-sm">
              <Store className="text-white" size={20} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-gray-900 leading-tight">FastDeli</h1>
              <p className="text-[10px] text-gray-500 -mt-0.5">Supplier</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center overflow-x-auto px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const hasBadge = item.badge && item.badge > 0;
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3 py-4 rounded-lg transition-all duration-200 whitespace-nowrap ${
                    active
                      ? 'bg-orange-50 text-orange-600 shadow-sm font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm hidden xl:inline">{item.label}</span>
                  {hasBadge && (
                    <span className="absolute top-0 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
              <Bell size={20} />
              {pendingOrders > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* User info */}
            {user && (
              <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-orange-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold shadow-sm text-sm">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'R'}
                  </div>
                )}
                <div className="hidden xl:block">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-900 max-w-[100px] truncate">
                      {restaurant?.name || user.full_name}
                    </span>
                    <span className="text-[10px] text-gray-500">Chủ nhà hàng</span>
                  </div>
                </div>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors flex-shrink-0"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-gray-200 shadow-lg bg-white">
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
                    key={item.id}
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
