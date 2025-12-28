'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { adminAPI } from '@/app/utils/api';
import type { Restaurant, RestaurantsResponse } from '@/app/types/admin';
import { getRelativeTime } from '@/lib/utils';

export default function ApprovedRestaurantsPage() {
  const [data, setData] = useState<RestaurantsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, [statusFilter]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);

      const result = await adminAPI.getRestaurants({
        status: 'active', // Chỉ lấy approved/active
        search
      });
      
      setData(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    if (!confirm(`${currentStatus ? 'Tạm dừng' : 'Kích hoạt'} nhà hàng này?`)) return;
    try {
      await adminAPI.toggleRestaurantActive(id);
      fetchRestaurants();
    } catch (error) {
      alert('Có lỗi xảy ra!');
    }
  };


  return (
    <AdminLayout 
      title="Nhà hàng đã duyệt" 
      subtitle="Danh sách nhà hàng đang hoạt động"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl card-shadow">
          <div className="text-2xl font-bold text-green-600 mb-2">156</div>
          <div className="text-gray-600">Tổng nhà hàng</div>
        </div>
        <div className="bg-white p-6 rounded-xl card-shadow">
          <div className="text-2xl font-bold text-blue-600 mb-2">142</div>
          <div className="text-gray-600">Đang hoạt động</div>
        </div>
        <div className="bg-white p-6 rounded-xl card-shadow">
          <div className="text-2xl font-bold text-orange-600 mb-2">14</div>
          <div className="text-gray-600">Tạm ngưng</div>
        </div>
        <div className="bg-white p-6 rounded-xl card-shadow">
          <div className="text-2xl font-bold text-purple-600 mb-2">23</div>
          <div className="text-gray-600">Mới tuần này</div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl card-shadow mb-6 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm">
              <option value="">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm ngưng</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đánh giá
            </label>
            <select className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm">
              <option value="">Tất cả</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao trở lên</option>
              <option value="3">3 sao trở lên</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input 
              type="text" 
              placeholder="Tên nhà hàng, email..."
              className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm w-64"
            />
          </div>
          <div className="flex items-end">
            <button className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors text-sm">
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Approved Restaurants Table */}
      <div className="bg-white rounded-xl card-shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Nhà hàng đã phê duyệt</h2>
              <p className="text-gray-600 mt-1">Quản lý {data?.restaurants.length || 0} nhà hàng</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors">
                Thêm nhà hàng
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                Xuất Excel
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhà hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa chỉ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tham gia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.restaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={restaurant.image_url || '/placeholder-restaurant.jpg'}
                          alt={restaurant.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {restaurant.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {restaurant.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{restaurant.email}</div>
                    <div className="text-gray-500">{restaurant.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {restaurant.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">⭐</span>
                      <span className="font-semibold">{restaurant.rating}</span>
                      <span className="text-gray-500 ml-1">
                        ({restaurant.total_reviews} đánh giá)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      restaurant.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {restaurant.is_active ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getRelativeTime(restaurant.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button className="text-primary-600 hover:text-primary-700">
                        Chi tiết
                      </button>
                      <button className={`${
                        restaurant.is_active 
                          ? 'text-orange-600 hover:text-orange-700' 
                          : 'text-green-600 hover:text-green-700'
                      }`}>
                        {restaurant.is_active ? 'Tạm dừng' : 'Kích hoạt'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}