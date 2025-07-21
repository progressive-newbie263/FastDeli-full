'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import { useRouter } from 'next/navigation';
import { useAuth } from '@food/context/AuthContext';
import { IoCartOutline } from "react-icons/io5";

import { FullCart } from '../../utils/cartHandler';

// cart item trong localStroage chỉ lấy ra food-id 
// và quantity đi kèm tương ứng của nó 
interface CartItem {
  food_id: number;
  quantity: number;
}

// phân nhánh và chia nhỏ 2 thg này tạm ra
interface Cart {
  [restaurant_id: string]: CartItem[];
}
interface HeaderProps {
  isAuthenticated?: boolean;
}


// main event
const Header = ({ isAuthenticated: propIsAuthenticated }: HeaderProps) => {
  const { currentUser, isAuthenticated: contextIsAuthenticated, logout } = useAuth();
  const router = useRouter();
  const isAuthenticated = contextIsAuthenticated ?? propIsAuthenticated ?? false;

  // 👉 Lấy số lượng tổng trong localStorage
  const [cartQuantity, setCartQuantity] = useState(0);

  // Hàm tính tổng số món trong cart với cấu trúc mới
  const getTotalItemsFromCart = (): number => {
    const raw = localStorage.getItem('cart');
    if (!raw) return 0;

    try {
      const parsed: FullCart = JSON.parse(raw);
      return Object.values(parsed).flat().reduce((sum, item) => sum + item.quantity, 0);
    } catch {
      return 0;
    }
  };

  // đảm bảo cập nhật cả cart quantity trên thanh header
  useEffect(() => {
    const updateCartQuantityHeader = () => {
      const total = getTotalItemsFromCart();
      setCartQuantity(total);
    };

    updateCartQuantityHeader();
    window.addEventListener('storage', updateCartQuantityHeader);
    window.addEventListener('cart-updated', updateCartQuantityHeader); 

    return () => {
      window.removeEventListener('storage', updateCartQuantityHeader);
      window.removeEventListener('cart-updated', updateCartQuantityHeader); 
    };
  }, []);


  const handleLogout = () => {
    /* trước hết thì đây là 1 hạn chế lớn, cần lưu ý:
      - Khi đăng xuất nếu ko xóa cart thì ở cùng 1 thiết bị, người dùng tiếp theo vẫn dính cái giỏ cũ.
      - Khá phiền phức. Nhưng nếu xóa cart thì người dùng trước đó cũng sẽ mất giỏ hàng của mình.
      - Đây là cái giá phải đánh đổi. Cách fix là phải làm cart + cart_items và lưu vào server. 
      Hiện tại chưa làm được, để nguyên ở đó.

      - router.refresh giúp đăng xuất trả về ngay trang đang hiển thị.
    */
    localStorage.removeItem('cart'); 
    setCartQuantity(0); // tự động cho về 0 khi logout (vì đã xóa cart rồi)
    
    logout();
    router.refresh();
  };

  const handleLoginClick = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
    }
    router.push('/food-service/auth/login');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <div className="w-full max-w-screen-2xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/food-service" className="flex items-center">
          <img src="/logo/fooddeli-logo.png" alt="FoodDeli" className="h-10" />
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/food-service" className="text-gray-700 hover:text-[#00B14F]">Trang chủ</Link>
          <Link href="/food-service/restaurants" className="text-gray-700 hover:text-[#00B14F]">Nhà hàng</Link>
          <Link href="/food-service/promotions" className="text-gray-700 hover:text-[#00B14F]">Khuyến mãi</Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link
            href="/food-service/cart"
            className="text-gray-700 hover:text-[#00B14F] text-2xl border border-gray-300 px-2 py-2 rounded transition-colors"
          >
            <div className='relative'>
              <IoCartOutline />

              {cartQuantity > 0 && (
                <span className="bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center absolute -top-4 -right-4">
                  {cartQuantity}
                </span>
              )}
            </div> 
          </Link>
          

          {isAuthenticated && currentUser ? (
            <div className="flex items-center space-x-4">
              <Link href="/food-service/profile" className="text-gray-700 hover:text-[#00B14F]">
                <img
                  src={currentUser?.avatar_url || 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'}
                  alt={currentUser?.full_name || 'User'}
                  className="h-10 w-10 rounded-full object-cover cursor-pointer"
                />
              </Link>

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
                onClick={handleLoginClick}
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