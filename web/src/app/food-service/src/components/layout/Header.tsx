"use client"

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="GrabFood" className="h-10" />
          <span className="text-2xl font-bold text-[#00B14F] ml-2">GrabFood</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-gray-700 hover:text-[#00B14F]">
            Trang chủ
          </Link>
          <Link href="/restaurants" className="text-gray-700 hover:text-[#00B14F]">
            Nhà hàng
          </Link>
          <Link href="/promotions" className="text-gray-700 hover:text-[#00B14F]">
            Khuyến mãi
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src={currentUser?.avatar_url || 'https://via.placeholder.com/150'} 
                  alt={currentUser?.full_name} 
                  className="h-8 w-8 rounded-full"
                />
                <Link href="/profile" className="text-gray-700 hover:text-[#00B14F]">
                  {currentUser?.full_name}
                </Link>
              </div>
              <button 
                onClick={handleLogout}
                className="text-gray-700 hover:text-[#00B14F] border border-gray-300 px-3 py-1 rounded"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-[#00B14F] border border-gray-300 px-4 py-2 rounded"
              >
                Đăng nhập
              </Link>
              <Link 
                href="/register" 
                className="bg-[#00B14F] hover:bg-[#009a45] text-white px-4 py-2 rounded"
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