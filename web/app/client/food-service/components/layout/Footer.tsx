import React from 'react';
import Link from 'next/link';
import ClientLink from '../ClientLink';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white w-full">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1">
            <ClientLink href="/" className="flex items-center">
              <img src="/logo/fooddeli-logo.png" alt="GrabFood" className="h-10" />
            </ClientLink>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Giới thiệu</h3>
            
            <ul className="space-y-2">
              <li>
                <ClientLink href="/" className="text-gray-400 hover:text-white">
                  Trang chủ
                </ClientLink>
              </li>
              
              <li>
                <ClientLink href="/restaurants" className="text-gray-400 hover:text-white">
                  Nhà hàng
                </ClientLink>
              </li>
              
              <li>
                <ClientLink href="/promotions" className="text-gray-400 hover:text-white">
                  Khuyến mãi
                </ClientLink>
              </li>
              
              <li>
                <ClientLink href="/about" className="text-gray-400 hover:text-white">
                  Về chúng tôi
                </ClientLink>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Pháp lý</h3>

            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Điều khoản sử dụng
                </Link>
              </li>
              
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Chính sách bảo mật
                </Link>
              </li>
              
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Chính sách hoàn tiền
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">
                <strong className="text-white">Địa chỉ:</strong> 123 Đường ABC, Hà Nội, Việt Nam
              </li>
              
              <li className="text-gray-400">
                <strong className="text-white">Điện thoại:</strong> 0123-456-789
              </li>
              
              <li className="text-gray-400">
                <strong className="text-white">Email:</strong> support@food-deli.com
              </li>
            </ul>

            {/* Social Media */}
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-facebook"></i>
              </a>
              
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-twitter"></i>
              </a>
              
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-gray-400">
          <p>© {new Date().getFullYear()} FoodDeli. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;