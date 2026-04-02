'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { adminAPI } from '@/app/utils/api';
import type { User, UsersResponse } from '@/app/types/admin';

export default function DriversAdmin() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const result = await adminAPI.getUsers({
        page,
        limit: 20,
        search,
        role: 'driver',
      });
      setData(result);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      alert('Không tải được danh sách tài xế.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDrivers();
  };

  const handleToggleActive = async (driver: User) => {
    const nextStatus = !driver.is_active;
    if (!confirm(`Bạn có chắc muốn ${nextStatus ? 'kích hoạt' : 'vô hiệu'} tài xế này?`)) {
      return;
    }

    try {
      await adminAPI.updateUser(driver.user_id, {
        full_name: driver.full_name,
        phone_number: driver.phone_number,
        role: 'driver',
        is_active: nextStatus,
      });
      await fetchDrivers();
    } catch (error) {
      console.error('Error updating driver status:', error);
      alert('Cập nhật trạng thái tài xế thất bại.');
    }
  };

  if (loading && !data) {
    return (
      <ProtectedRoute>
        <AdminLayout title="Quản lý tài xế">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout title="Quản lý tài xế" subtitle={`Tổng: ${data?.pagination.total || 0} tài xế`}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-transparent dark:border-gray-700">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="Tìm theo tên, email, số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-transparent dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Điện thoại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngày tạo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data?.users.map((driver) => (
                  <tr key={driver.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{driver.user_id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{driver.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{driver.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{driver.phone_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {new Date(driver.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          driver.is_active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        {driver.is_active ? 'Hoạt động' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(driver)}
                        className={`text-sm font-medium hover:underline ${
                          driver.is_active ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        {driver.is_active ? 'Vô hiệu' : 'Kích hoạt'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Trang {data.pagination.page} / {data.pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900"
                >
                  Trước
                </button>
                <button
                  disabled={page === data.pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
