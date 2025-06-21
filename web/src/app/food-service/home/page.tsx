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
      {/* ảnh minh họa + hộp thoại */}
      <div className="relative h-[400px]">
        <div 
          className="absolute inset-0 opacity-60 z-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url("https://food-cms.grab.com/compressed_webp/cuisine/144/icons/Rice_e191965ccd6848a3862e6a695d05983f_1547819238893335910.webp")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full mt-[220px]">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full md:w-[350px]">
              <p className="text-lg md:text-xl mb-2 text-gray-700">Good Afternoon</p>
              
              <h1 className="text-4xl font-bold mb-8 text-gray-900">
                Where should we deliver your food today?
              </h1>
              
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>

                  {/* 
                    đọc dữ liệu đầu vào ở thanh input
                  */}
                  <input 
                    type="text"
                    id="search-input" 
                    placeholder="Nhập địa chỉ của bạn"
                    className="w-full pl-10 pr-12 py-4 border border-gray-300 rounded-lg"
                  />

                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full cursor-pointer duration-250">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/*
                - input nếu có 1 cái gì đó thì tự động lọc ra các nhà hàng có tên như vậy, tạm 
                thời điều hướng về #
                - input trống, bấm tìm kiếm thì hiển thị mọi nhà hàng.
              */}
              <button onClick={() => {
                const input = document.getElementById('search-input') as HTMLInputElement | null;
                const query = input?.value.trim() || '';

                if (query === '') {
                  window.location.href = '/food-service/restaurants';
                } else {
                  window.location.href = `/food-service/#${encodeURIComponent(query)}`;
                }
              }}
              
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-lg transition-colors mb-6 
                cursor-pointer duration-250"
              >
                Tìm kiếm nhà hàng
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* vạch chia section */}
      <div className='bg-gray-200 h-[2px] mt-[60px]'></div>


      {/* nhà hàng */}
      <div className="py-16 max-w-6xl mx-auto px-4 text-center text-black bg-white mt-[80px]">
        abc
      </div>


      {/* chưa đăng nhập thì đăng nhập đi. còn rồi thì bấm chọn nhà hàng/món ăn */}
      <div className="py-16 max-w-6xl mx-auto px-4 text-center text-black bg-white mt-[200px]">
        {!isLoggedIn ? (
          <>
            <h2 className="text-3xl font-bold mb-6">Trải nghiệm dịch vụ hàng đầu chỉ với một thao tác đăng nhập</h2>
          
            <p className="text-lg text-gray-700 mb-8">
              Sử dụng mọi dịch vụ hàng đầu từ những nhà hàng xuất sắc nhất từ phía chúng tôi với ưu đãi rẻ nhất
            </p>

            <Link
              href="/food-service/auth/register"
              className="inline-block px-8 py-4 bg-orange-500 text-white rounded-lg text-xl font-semibold hover:bg-orange-600"
            >
              Đăng ký miễn phí
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-6">Đặt món ăn ngay</h2>
          
            <p className="text-lg text-gray-700 mb-8">
              Bắt đầu trải nghiệm dịch vụ giao đồ ăn nhanh chóng, tiện lợi ngay hôm nay.
            </p>

            <Link
              href="/food-service/restaurants"
              className="inline-block px-8 py-4 bg-orange-500 text-white rounded-lg text-xl font-semibold hover:bg-orange-600"
            >
              Khám phá nhà hàng
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
