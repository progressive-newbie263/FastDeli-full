'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { adminAPI } from '@/app/utils/api';
import type { Restaurant, RestaurantsResponse } from '@/app/types/admin';

export default function PendingRestaurantsPage() {
  const [data, setData] = useState<RestaurantsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingRestaurants();
  }, []);

  const fetchPendingRestaurants = async () => {
    try {
      setLoading(true);
      const result = await adminAPI.getRestaurants({ status: 'pending' });
      setData(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number, name: string) => {
    if (!confirm(`Duyệt nhà hàng "${name}"?`)) return;
    try {
      await adminAPI.approveRestaurant(id);
      alert('Đã duyệt!');
      fetchPendingRestaurants();
    } catch (error) {
      alert('Có lỗi xảy ra!');
    }
  };

  const handleReject = async (id: number, name: string) => {
    const reason = prompt(`Lý do từ chối "${name}":`);
    if (!reason) return;
    try {
      await adminAPI.rejectRestaurant(id, reason);
      alert('Đã từ chối!');
      fetchPendingRestaurants();
    } catch (error) {
      alert('Có lỗi xảy ra!');
    }
  };

  if (loading) {
    return <AdminLayout title="Đang tải..."><div>Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout 
      title="Nhà hàng chờ duyệt" 
      subtitle={`${data?.pagination.total || 0} nhà hàng đang chờ phê duyệt`}
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
          <div className="text-3xl font-bold text-yellow-600">{data?.pagination.total || 0}</div>
          <div className="text-gray-700 mt-1">Chờ duyệt</div>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <div className="text-3xl font-bold text-blue-600">12</div>
          <div className="text-gray-700 mt-1">Tuần này</div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
          <div className="text-3xl font-bold text-purple-600">3.2 ngày</div>
          <div className="text-gray-700 mt-1">Thời gian duyệt TB</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhà hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chủ sở hữu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Địa chỉ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày gửi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.restaurants.map((restaurant) => (
              <tr key={restaurant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {restaurant.image_url && (
                      <img src={restaurant.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{restaurant.name}</p>
                      <p className="text-sm text-gray-500">{restaurant.email}</p>
                    </div>
                  </div>
                </td>
                
                {/*
                  ** Note: Tạm thời chưa đưa "tên chủ sở hữu" vào dữ liệu nhà hàng
                  ** Ẩn cột này đi
                  <td className="px-6 py-4">
                    {restaurant.owner ? (
                      <div>
                        <p className="font-medium">{restaurant.owner.full_name}</p>
                        <p className="text-sm text-gray-500">{restaurant.owner.phone_number}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td> 
                */}
                
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">{restaurant.address}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(restaurant.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(restaurant.id, restaurant.name)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      Duyệt
                    </button>
                    <button
                      onClick={() => handleReject(restaurant.id, restaurant.name)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Từ chối
                    </button>
                    <button className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
                      Chi tiết
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {data?.restaurants.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">🎉 Không có nhà hàng nào chờ duyệt!</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}