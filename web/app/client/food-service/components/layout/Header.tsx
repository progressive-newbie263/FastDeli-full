'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ClientLink from '../ClientLink';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@food/context/AuthContext';
import { ShoppingCart } from "lucide-react";

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
  const pathname = usePathname();
  const isAuthenticated = contextIsAuthenticated ?? propIsAuthenticated ?? false;

  // Lấy số lượng tổng trong localStorage
  const [cartQuantity, setCartQuantity] = useState(0);

  // CẢI THIỆN: Hàm tính tổng số món trong cart với error handling tốt hơn
  const getTotalItemsFromCart = (): number => {
    try {
      const raw = localStorage.getItem('cart');
      if (!raw) return 0;

      const parsed: FullCart = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return 0;

      const total = Object.values(parsed).reduce((totalSum, restaurantItems) => {
        if (!Array.isArray(restaurantItems)) return totalSum;
        
        return totalSum + restaurantItems.reduce((sum, item) => {
          if (!item || typeof item.quantity !== 'number' || item.quantity < 0) {
            return sum;
          }
          return sum + item.quantity;
        }, 0);
      }, 0);

      return isNaN(total) || total < 0 ? 0 : Math.floor(total);
    } catch (error) {
      console.error('Error calculating cart total:', error);
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
    //localStorage.setItem('cartQuantity', '0');
    window.dispatchEvent(new Event('cart-updated'));
    setCartQuantity(0);
    
    logout();
    router.refresh();
  };

  const handleLoginClick = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
    }
    router.push('/client/food-service/auth/login');
  };

  // highlight router/trang đang được chọn hiện tại
  const getLinkClass = (href: string, exact = false) => {
    /* 
      "exact" ở đây sẽ chỉ bao gồm "/" (tức là trang chủ)

      startsWith sẽ bao gồm cả "/restaurants", "/coupons", "/orders". 
      Vì "/" đã bao gồm cả trang chủ, nên phải ép thẳng nó ra "exact".
      Nếu ko nó ghi đè lên, thì trang chủ sẽ vĩnh viễn tỉnh là active.
    */
    const isActive = exact ? pathname === href : pathname.startsWith(href);

    return `transition-colors ${
      isActive ? 'text-[#00B14F] font-semibold border-b-2 border-[#00B14F]' : 'text-gray-700 hover:text-[#00B14F]'
    }`;
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <div className="w-full max-w-screen-2xl mx-auto px-4 py-3 flex justify-between items-center">
        <ClientLink href="/" className="flex items-center">
          <img src="/logo/fooddeli-logo.png" alt="FoodDeli" className="h-10" />
        </ClientLink>

        {/* note: thay vì md, ép thẳng 850px làm mốc đoạn này. cần ẩn đi sớm hơn, xuống tận md thì nhìn xấu quá. */} 
        <nav className="hidden [@media(min-width:850px)]:flex items-center space-x-6">
          {/*
              - default cho trang chủ sẽ là true (highlight mặc định)
              - các trang con khác sẽ xài 'startsWith' để highlight
          */}
          <Link href="/client/food-service" className={getLinkClass('/client/food-service', true)}>Trang chủ</Link>

          <Link href="/client/food-service/restaurants" className={getLinkClass('/client/food-service/restaurants')}>Nhà hàng</Link>
          <Link href="/client/food-service/coupons" className={getLinkClass('/client/food-service/coupons')}>Khuyến mãi</Link>
          <Link href="/client/food-service/orders" className={getLinkClass('/client/food-service/orders')}>Đơn hàng</Link>
        </nav>


        <div className="flex items-center space-x-4">
          <ClientLink 
            href="/cart"
            className="text-gray-700 hover:text-[#00B14F] text-2xl border border-gray-300 px-2 py-2 rounded transition-colors"
          >
            <div className='relative'>
              <ShoppingCart />

              {cartQuantity > 0 && (
                <span className="bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center absolute -top-4 -right-4">
                  {cartQuantity}
                </span>
              )}
            </div> 
          </ClientLink>
          

          {isAuthenticated && currentUser ? (
            <div className="flex items-center space-x-4">
              <ClientLink href="/profile" className="text-gray-700 hover:text-[#00B14F]">
                <img
                  src={currentUser?.avatar_url || 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'}
                  alt={currentUser?.full_name || 'User'}
                  className="h-10 w-10 rounded-full object-cover cursor-pointer"
                />
              </ClientLink>

              <button
                onClick={handleLogout}
                className="
                  border border-red-500
                  text-red-500
                  bg-white
                  hover:bg-red-500 hover:text-white
                  px-4 py-2 
                  rounded-md
                  transition-colors cursor-pointer duration-300
                "
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/client/food-service/auth/login"
                className="text-gray-700 hover:text-[#00B14F] border border-gray-300 px-4 py-2 rounded transition-colors"
                onClick={handleLoginClick}
              >
                Đăng nhập
              </Link>

              <Link
                href="/client/food-service/auth/register"
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