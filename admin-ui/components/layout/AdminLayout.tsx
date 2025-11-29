'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

import {
  FaTachometerAlt,
  FaShoppingCart,
  FaUtensils,
  FaUsers,
  FaCar,
  FaCog,
  FaChartBar,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from 'react-icons/fa';


interface NavItem {
  href: string;
  icon: JSX.Element;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/', icon: <FaTachometerAlt />, label: 'Dashboard' },
  { href: '/analytics', icon: <FaChartBar />, label: 'Thống kê' },
  { href: '/orders', icon: <FaShoppingCart />, label: 'Đơn hàng' },
  { href: '/restaurants', icon: <FaUtensils />, label: 'Nhà hàng' },
  { href: '/users', icon: <FaUsers />, label: 'Người dùng' },
  { href: '/drivers', icon: <FaCar />, label: 'Tài xế' },
  { href: '/settings', icon: <FaCog />, label: 'Cài đặt' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  // xử lí logic: xóa bỏ token khi logout
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // const [adminName, setAdminName] = useState('Admin');

  // Lấy tên của admin từ AuthContext, thay vì mặc định Admin. ko có thì mới lấy Admin
  const adminName = user?.full_name || 'Admin';

  useEffect(() => {
    // Lấy thông tin admin từ localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (parsed.name) setAdminName(parsed.name);
      } catch (error) {
        console.error('Error parsing userData:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 
        Mobile Overlay 
          + lưu ý: bg-black sẽ là optional cho className liền dưới. 
          + Có thể thiết kế để khi mở 'sidebar' với mobile hoặc màn hình nhỏ
          thì background phía sau mờ đi.
      */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-xl font-bold text-gray-800">FastDeli</span>
          </Link>
          
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Admin Info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {adminName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{adminName}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation - Chiếm phần giữa, có thể scroll */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 mb-1 rounded-lg transition-all duration-200
                ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button - Cố định ở dưới cùng, CHIẾM ĐỦ WIDTH SIDEBAR */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer
              text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
          >
            <FaSignOutAlt className="text-lg" />
            <span className="text-sm">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header - Mobile Menu Button */}
        <header className="lg:hidden bg-white shadow-sm px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-700 hover:text-blue-600"
          >
            <FaBars size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-800">FastDeli Admin</h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}