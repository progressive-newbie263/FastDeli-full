'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';

import {
  LayoutDashboard,
  ShoppingCart,
  Utensils,
  Users,
  Car,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
  Clock
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ReactElement;
  label: string;
}

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const navItems: NavItem[] = [
  { 
    href: '/', 
    icon: <LayoutDashboard />, 
    label: 'Dashboard' 
  },
  { 
    href: '/analytics',
    icon: <BarChart3 />, 
    label: 'Thống kê' 
  },
  { 
    href: '/orders', 
    icon: <ShoppingCart />, 
    label: 'Đơn hàng' 
  },
  { 
    href: '/restaurants', 
    icon: <Utensils />, 
    label: 'Nhà hàng' 
  },
  { 
    href: '/users', 
    icon: <Users />, 
    label: 'Người dùng' 
  },
  { 
    href: '/drivers', 
    icon: <Car />, 
    label: 'Tài xế' 
  },
  { 
    href: '/settings', 
    icon: <Settings />, 
    label: 'Cài đặt' 
  }
];

/*
  * FIX:
  * =============================
  * Truyền thêm props title và subtitle vào AdminLayout để có thể sử dụng chúng ở các page con.
*/
export default function AdminLayout({ 
  children,
  title, 
  subtitle 
}: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const adminName = user?.full_name || 'Admin';

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">FastDeli</span>
          </Link>
          
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Admin Info */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300 font-semibold text-sm">
                {adminName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{adminName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 mb-1 rounded-lg transition-all duration-200
                ${
                  isActive(item.href)
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          <ThemeToggle />
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer
              text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 font-medium"
          >
            <LogOut className="text-lg" />
            <span className="text-sm">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header - Mobile Menu Button */}
        <header className="md:hidden bg-white dark:bg-gray-800 shadow-sm px-4 
          py-3 flex items-center justify-between
        ">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            <Menu size={24} />
          </button>

          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            FastDeli Admin
          </h1>
          
          <div className="w-6" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* 
              * Feat: 
              * =============================
              * Hiển thị title và subtitle.
            */}
            {(title || subtitle) && (
              <div className="mb-6">
                {title && (
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}