// admin-ui/components/ui/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Đơn hàng', href: '/orders', icon: '📦' },
  { name: 'Nhà hàng', href: '/restaurants', icon: '🏪' },
  { name: 'Món ăn', href: '/foods', icon: '🍽️' },
  { name: 'Người dùng', href: '/users', icon: '👥' },
  { name: 'Khuyến mãi', href: '/promotions', icon: '🎁' },
  { name: 'Báo cáo', href: '/analytics', icon: '📈' },
  { name: 'Cài đặt', href: '/settings', icon: '⚙️' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 
      ${isCollapsed ? 'w-16' : 'w-72'}
    `}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="text-2xl font-bold text-primary-600">
            {isCollapsed ? 'FD' : 'FoodDeli Admin'}
          </div>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium">
                {user.full_name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                {user.full_name}
              </div>
              <div className="text-xs text-gray-500">
                {user.email}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-4 left-4 w-fit">
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium 
            text-red-600 hover:bg-red-50 transition-colors cursor-pointer duration-200
          "
        >
          <span className="text-lg mr-3">🚪</span>
          {!isCollapsed && <span>Đăng xuất</span>}
        </button>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-6 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full 
          flex items-center justify-center text-gray-500 hover:text-gray-700
        "
      >
        {isCollapsed ? '→' : '←'}
      </button>
    </div>
  );
}