// trang này tạm thời hủy, ko đụng đến
'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Home = () => {
  // Kiểm tra đăng nhập
  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('token') !== null;
  const userData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userData') || '{}') : {};

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'FoodDeli - Đặt đồ ăn trực tuyến';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ảnh minh họa chính */}
      <div className="relative bg-gray-900 text-white">
        <div 
          className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
          style={{ 
            backgroundImage: `url("https://food-cms.grab.com/compressed_webp/cuisine/144/icons/Rice_e191965ccd6848a3862e6a695d05983f_1547819238893335910.webp")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 md:py-32">
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Thưởng thức món ăn yêu thích tại nhà</h1>

            <p className="text-lg md:text-xl mb-8">
              Đặt món từ hàng ngàn nhà hàng và được giao hàng nhanh chóng
            </p>
            {!isLoggedIn ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/food-service/auth/login" 
                  className="px-6 py-3 bg-white text-orange-500 hover:bg-gray-100 rounded-lg font-medium text-center"
                >
                  Đăng nhập
                </Link>

                <Link href="/food-service/auth/register" 
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium text-center"
                >
                  Đăng ký ngay
                </Link>
              </div>
            ) : (
              <Link href="/food-service/profile">
                <div className="px-6 py-3 bg-white text-orange-500 rounded-lg inline-block">
                  Xem thông tin tài khoản
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 max-w-6xl mx-auto px-4 text-black">
        <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn GrabFood?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Giao hàng nhanh chóng</h3>
            <p className="text-gray-600">
              Chúng tôi cam kết giao hàng đúng giờ để bạn có thể thưởng thức món ăn khi còn nóng hổi
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Đa dạng lựa chọn</h3>
            <p className="text-gray-600">
              Hàng ngàn nhà hàng và cửa hàng đồ ăn với đầy đủ loại món ăn từ địa phương đến quốc tế
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Thanh toán an toàn</h3>
            <p className="text-gray-600">
              Nhiều phương thức thanh toán an toàn và bảo mật cho mọi giao dịch của bạn
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-orange-50 py-16 text-black">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Cách thức hoạt động</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Đăng nhập</h3>
              <p className="text-gray-600">
                Tạo tài khoản hoặc đăng nhập vào hệ thống
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Chọn nhà hàng</h3>
              <p className="text-gray-600">
                Khám phá các nhà hàng gần bạn
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Đặt món</h3>
              <p className="text-gray-600">
                Lựa chọn món ăn yêu thích và thêm vào giỏ hàng
              </p>
            </div>
            
            {/* Step 4 */}
            <div className="text-center">
              <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">Nhận món</h3>
              <p className="text-gray-600">
                Theo dõi đơn hàng và thưởng thức món ăn khi được giao tới
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 max-w-6xl mx-auto px-4 text-center text-black">
        <h2 className="text-3xl font-bold mb-6">Đặt món ăn ngay!</h2>
        <p className="text-lg text-gray-700 mb-8">
          Bắt đầu trải nghiệm dịch vụ giao đồ ăn nhanh chóng, tiện lợi ngay hôm nay.
        </p>
        {!isLoggedIn ? (
          <Link
            href="/food-service/auth/register"
            className="inline-block px-8 py-4 bg-orange-500 text-white rounded-lg text-xl font-semibold hover:bg-orange-600"
          >
            Đăng ký miễn phí
          </Link>
        ) : (
          <Link
            href="/restaurants"
            className="inline-block px-8 py-4 bg-orange-500 text-white rounded-lg text-xl font-semibold hover:bg-orange-600"
          >
            Khám phá nhà hàng
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;
