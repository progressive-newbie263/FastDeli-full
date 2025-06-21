"use client"

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@food/context/AuthContext';

interface HeaderProps {
  isAuthenticated?: boolean;
}

const Header = ({ isAuthenticated: propIsAuthenticated }: HeaderProps) => {
  const { currentUser, isAuthenticated: contextIsAuthenticated, logout } = useAuth();
  const router = useRouter();

  const isAuthenticated = contextIsAuthenticated ?? propIsAuthenticated ?? false;

  const handleLogout = () => {
    logout();
    router.push('/food-service');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/food-service" className="flex items-center">
          <img src="/logo/fooddeli-logo.png" alt="FoodDeli" className="h-10" />
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/food-service" className="text-gray-700 hover:text-[#00B14F]">Trang chủ</Link>
          <Link href="/food-service/restaurants" className="text-gray-700 hover:text-[#00B14F]">Nhà hàng</Link>
          <Link href="/food-service/promotions" className="text-gray-700 hover:text-[#00B14F]">Khuyến mãi</Link>
        </nav>

        <div className="flex items-center space-x-4">
          {isAuthenticated && currentUser ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src={currentUser?.avatar_url || 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'} 
                  alt={currentUser?.full_name || 'User'} 
                  className="h-8 w-8 rounded-full object-cover"
                />
                <Link href="/food-service/profile" className="text-gray-700 hover:text-[#00B14F]">
                  {currentUser?.full_name || 'User'}
                </Link>
              </div>
              
              <button 
                onClick={handleLogout}
                className="text-gray-700 hover:text-[#00B14F] border border-gray-300 px-3 py-1 rounded transition-colors cursor-pointer duration-300"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <Link 
                href="/food-service/auth/login" 
                className="text-gray-700 hover:text-[#00B14F] border border-gray-300 px-4 py-2 rounded transition-colors"
              >
                Đăng nhập
              </Link>
              <Link 
                href="/food-service/auth/register" 
                className="bg-[#00B14F] hover:bg-[#009a45] text-white px-4 py-2 rounded transition-colors"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
