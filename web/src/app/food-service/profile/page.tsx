"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

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
    document.title = 'Tài khoản của tôi | FoodDeli';
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // token từ local storage
      const token = localStorage.getItem('token');
      
      // chưa đăng nhập (chưa có token) thì tự cút về route login
      if (!token) {
        console.log('No token found, redirecting to login');
        router.push('/food-service/auth/login');
        return;
      }

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    router.push('/food-service');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return 'Chưa cập nhật';
    }
  };

  const formatBalance = (balance?: number) => {
    if (typeof balance !== 'number') return '0 VNĐ';
    return `${balance.toLocaleString('vi-VN')} VNĐ`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Đã xảy ra lỗi</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={loadUserProfile}
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
            >
              Thử lại
            </button>
            <button 
              onClick={handleLogout}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy thông tin người dùng.</p>
          <button 
            onClick={loadUserProfile}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
          >
            Tải lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header section */}
          <div className="bg-orange-500 text-white p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <h1 className="text-2xl font-bold">Tài khoản của tôi</h1>
              <button 
                onClick={handleLogout}
                className="mt-4 md:mt-0 bg-white text-orange-500 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>

          {/* User info section */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 flex-shrink-0">
                <img 
                  src={userData.avatar_url || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"} 
                  alt={userData.full_name || "User"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";
                  }}
                />
              </div>
              
              <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                <h2 className="text-xl font-semibold text-gray-800">{userData.full_name || 'Chưa cập nhật'}</h2>
                <p className="text-gray-600">{userData.email || 'Chưa cập nhật'}</p>
                {userData.phone_number && (
                  <p className="text-gray-600">{userData.phone_number}</p>
                )}
                <button className="mt-2 text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors">
                  Cập nhật ảnh đại diện
                </button>
              </div>
            </div>
            
            <hr className="my-6" />
            
            {/* Personal info */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Thông tin cá nhân</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Họ và tên</p>
                  <p className="text-gray-800">{userData.full_name || 'Chưa cập nhật'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-800">{userData.email || 'Chưa cập nhật'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="text-gray-800">{userData.phone_number || 'Chưa cập nhật'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Giới tính</p>
                  <p className="text-gray-800">{userData.gender || 'Chưa cập nhật'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Ngày sinh</p>
                  <p className="text-gray-800">{formatDate(userData.date_of_birth)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">ID người dùng</p>
                  <p className="text-gray-800">{userData.user_id || userData.id || 'N/A'}</p>
                </div>
              </div>
              
              <button className="mt-6 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors">
                Cập nhật thông tin
              </button>
            </div>
            

            {/* <hr className="my-6" /> */}
            
            {/* <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Số dư tài khoản</h3>
              <p className="text-2xl font-bold text-orange-500">
                {formatBalance(userData.account_balance)}
              </p>
              
              <div className="mt-4 flex flex-wrap gap-4">
                <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors">
                  Nạp tiền
                </button>
                <button className="border border-orange-500 text-orange-500 px-4 py-2 rounded-md hover:bg-orange-50 transition-colors">
                  Lịch sử giao dịch
                </button>
              </div>
            </div> */}

            {/* Debug */}
            {/* <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Debug Info:</h4>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div> */}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;