'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { adminAPI } from '@/app/utils/api';
import type { User, UsersResponse } from '@/app/types/admin';
import { formatCurrency } from '@/lib/utils';

export default function UsersAdmin() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await adminAPI.getUsers({
        page,
        limit: 20,
        search,
        role: roleFilter
      });
      setData(result);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleActive = async (userId: number, currentStatus: boolean) => {
    if (!confirm(`Bạn có chắc muốn ${currentStatus ? 'vô hiệu hóa' : 'kích hoạt'} người dùng này?`)) {
      return;
    }

    try {
      await adminAPI.updateUser(userId, { is_active: !currentStatus });
      fetchUsers(); // Refresh
    } catch (error) {
      alert('Có lỗi xảy ra!');
    }
  };

  if (loading && !data) {
    return (
      <AdminLayout title="Quản lý người dùng">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Quản lý người dùng" subtitle={`Tổng: ${data?.pagination.total || 0} người dùng`}>
      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-transparent dark:border-gray-700">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="">Tất cả vai trò</option>
            <option value="customer">Khách hàng</option>
            <option value="restaurant_owner">Chủ nhà hàng</option>
            <option value="shipper">Shipper</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-transparent dark:border-gray-700">
        {/* THÊM div bọc ngoài này để hỗ trợ cuộn ngang trên mobile thay vì vỡ dòng */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Điện thoại</th>
                {/* Thêm whitespace-nowrap vào các header quan trọng */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">Đơn hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">Chi tiêu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data?.users.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{user.user_id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{user.full_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.phone_number}</td>
                  
                  {/* Fix cột Vai trò */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                      user.role === 'restaurant_owner' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                      user.role === 'shipper' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {user.role === 'admin' ? 'Admin' :
                      user.role === 'restaurant_owner' ? 'Nhà hàng' :
                      user.role === 'shipper' ? 'Shipper' :
                      'Khách hàng'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 text-center">{user.total_orders || 0}</td>
                  
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                    {formatCurrency(user.total_spent || 0)}
                  </td>
                  
                  {/* Fix cột Trạng thái */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.is_active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {user.is_active ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                  
                  {/* Fix cột Thao tác */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <a
                        href={`/users/${user.user_id}`}
                        className="text-primary-600 hover:underline dark:text-primary-400 font-medium text-sm"
                      >
                        Chi tiết
                      </a>
                      <button
                        onClick={() => handleToggleActive(user.user_id, user.is_active)}
                        className={`text-sm font-medium hover:underline ${
                          user.is_active ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        {user.is_active ? 'Vô hiệu' : 'Kích hoạt'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
  );
}