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
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
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
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điện thoại</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chi tiêu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.users.map((user) => (
              <tr key={user.user_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{user.user_id}</td>
                <td className="px-6 py-4 text-sm font-medium">{user.full_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.phone_number}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-700' :
                    user.role === 'restaurant_owner' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'shipper' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role === 'admin' ? 'Admin' :
                     user.role === 'restaurant_owner' ? 'Chủ NHà' :
                     user.role === 'shipper' ? 'Shipper' :
                     'Khách hàng'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{user.total_orders || 0}</td>
                <td className="px-6 py-4 text-sm font-semibold">
                  {formatCurrency(user.total_spent || 0)}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.is_active ? 'Hoạt động' : 'Vô hiệu'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <a
                      href={`/users/${user.user_id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      Chi tiết
                    </a>
                    <button
                      onClick={() => handleToggleActive(user.user_id, user.is_active)}
                      className="text-orange-600 hover:text-orange-700 text-sm"
                    >
                      {user.is_active ? 'Vô hiệu' : 'Kích hoạt'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Trang {data.pagination.page} / {data.pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Trước
              </button>
              <button
                disabled={page === data.pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 border rounded disabled:opacity-50"
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