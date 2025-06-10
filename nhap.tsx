"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

// tạm thời hủy bỏ tính năng tài khoản. Có vẻ thiết kế kiểu, chuyển khoản trực tiếp qua ngân hàng sẽ tiện hơn.
interface UserData {
  user_id?: number;
  id?: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  avatar_url?: string;
  gender?: string;
  date_of_birth?: string;
  //account_balance?: number;
  created_at?: string;
}

const Profile = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    document.title = 'Tài khoản | FoodDeli';
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // token từ local storage
      // chưa đăng nhập (chưa có token) thì tự cút về route login
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        router.push('/food-service/auth/login');
        return;
      }

      // dữ liệu người dùng từ local storage
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData);
          console.log('Loaded user data from localStorage:', parsedData);
          
          // Handle different data structures
          let processedData: UserData;
          if (parsedData.user) {
            processedData = parsedData.user;
          } else {
            processedData = parsedData;
          }
          
          setUserData(processedData);
          setLoading(false);
        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError);
        }
      }

      // Then fetch fresh data from API
      console.log('Fetching fresh user data from API...');
      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response:', response.data);
      
      // Handle different API response structures
      let apiUserData: UserData;
      if (response.data.user) {
        apiUserData = response.data.user;
      } else {
        apiUserData = response.data;
      }
      setUserData(apiUserData);
      setError(null);
      
      // cập nhật localStorage
      localStorage.setItem('userData', JSON.stringify(apiUserData));

    } catch (error: any) {
      console.error('Error loading user profile:', error);
      
      //code này đảm bảo người dùng ko thể sử dụng 1 số tính năng khi chưa đăng nhập (ví dụ: xem thông tin tài khoản)
      if (error.response?.status === 401) {
        console.log('Token expired or invalid, clearing auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');

        router.push('/food-service/auth/login');
      } else {
        setError('Vui lòng đăng nhập để theo dõi thông tin tài khoản.');
      }
    } finally {
      setLoading(false);
    }
  };

  // xóa token + data khi đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    router.push('/food-service');
  };

  // định dạng ngày tháng
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return 'Chưa cập nhật';
    }
  };

  // dummy function chờ load.
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-green-100">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-100 border-t-green-500 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-green-500 opacity-10 animate-pulse"></div>
          </div>

          <p className="mt-6 text-gray-700 font-medium">Đang tải thông tin tài khoản...</p>

          <div className="mt-2 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center max-w-md w-full">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-2xl font-bold mb-3 text-gray-800">Đã xảy ra lỗi</h3>

            <p className="text-gray-600 leading-relaxed">{error}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={loadUserProfile}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 
                rounded-xl hover:from-green-600 hover:to-emerald-600 
                transition-all duration-200 transform hover:scale-105 font-medium shadow-lg"
            >
              Thử lại
            </button>

            <button 
              onClick={handleLogout}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-200"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-green-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          <p className="text-gray-600 mb-6 font-medium">Không tìm thấy thông tin người dùng.</p>

          <button 
            onClick={loadUserProfile} 
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl 
              hover:from-green-600 hover:to-emerald-600 transition-all duration-200 
              transform hover:scale-105 font-medium shadow-lg"
          >
            Tải lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className='h-20 w-full bg-white'>
        <Link href="/food-service" className="flex items-center justify-center">
          <img src="/logo/fooddeli-logo.png" className='w-60 h-20'/>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-teal-600/20"></div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between">
              
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">Tài khoản của tôi</h1>
                
              <button 
                onClick={handleLogout}
                className="mt-6 lg:mt-0 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-200 font-medium border border-white/30 flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-green-200 shadow-lg group-hover:border-green-300 transition-colors duration-200">
                  <img 
                    src={userData.avatar_url || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"} 
                    alt={userData.full_name || "User"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";
                    }}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-green-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{userData.full_name || 'Chưa cập nhật'}</h2>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-center lg:justify-start space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <span className="text-gray-600">{userData.email || 'Chưa cập nhật'}</span>
                  </div>
                  {userData.phone_number && (
                    <div className="flex items-center justify-center lg:justify-start space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-600">{userData.phone_number}</span>
                    </div>
                  )}
                </div>
                <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg flex items-center space-x-2 mx-auto lg:mx-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Cập nhật ảnh đại diện</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 border-b border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h3>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[
                { label: 'Họ và tên', value: userData.full_name, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                { label: 'Email', value: userData.email, icon: 'M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207' },
                { label: 'Số điện thoại', value: userData.phone_number, icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                { label: 'Giới tính', value: userData.gender, icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                { label: 'Ngày sinh', value: formatDate(userData.date_of_birth), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                { label: 'ID người dùng', value: userData.user_id || userData.id || 'N/A', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' }
              ].map((item, index) => (
                <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-600 mb-1">{item.label}</p>
                      
                      <p className="text-gray-800 font-semibold truncate">{item.value || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg flex items-center justify-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                
                <span>Cập nhật thông tin</span>
              </button>
              
              <button className="bg-white text-green-600 px-8 py-4 rounded-xl hover:bg-green-50 transition-all duration-200 font-medium border-2 border-green-200 hover:border-green-300 flex items-center justify-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>

                <span>Đổi mật khẩu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Additional Options Card */}
        <div className="mt-8 bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 border-b border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Cài đặt tài khoản</h3>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Lịch sử đơn hàng', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
                { title: 'Địa chỉ giao hàng', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
                { title: 'Thông báo', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
                { title: 'Hỗ trợ', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
              ].map((item, index) => (
                <button key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 hover:shadow-md hover:from-green-100 hover:to-emerald-100 transition-all duration-200 text-left group">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">{item.title}</h4>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;