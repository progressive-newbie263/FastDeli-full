import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="GrabFood" className="h-12" />
              <span className="text-xl font-bold text-white ml-2">GrabFood</span>
            </Link>

            <p className="mt-4 text-gray-400">
              Dịch vụ giao đồ ăn nhanh chóng và tiện lợi.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Nhanh chóng</h3>
            
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Trang chủ
                </Link>
              </li>
              
              <li>
                <Link href="/restaurants" className="text-gray-400 hover:text-white">
                  Nhà hàng
                </Link>
              </li>
              
              <li>
                <Link href="/promotions" className="text-gray-400 hover:text-white">
                  Khuyến mãi
                </Link>
              </li>
              
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white">
                  Về chúng tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Pháp lý</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white">
                  Điều khoản sử dụng
                </Link>
              </li>
              
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white">
                  Chính sách bảo mật
                </Link>
              </li>
              
              <li>
                <Link href="/refunds" className="text-gray-400 hover:text-white">
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
                <strong className="text-white">Địa chỉ:</strong> 123 Đường ABC, Quận 1, TP.HCM
              </li>
              
              <li className="text-gray-400">
                <strong className="text-white">Điện thoại:</strong> 1900 1234
              </li>
              
              <li className="text-gray-400">
                <strong className="text-white">Email:</strong> support@grabfood.com
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
          <p>© {new Date().getFullYear()} GrabFood Clone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;