'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import StatsCard from '@/components/ui/StatsCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { adminAPI } from '@/app/utils/api';
import type { Driver, DriversResponse } from '@/app/types/admin';
import { Car, DollarSign, Package, Star, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  online: 'Trực tuyến',
  offline: 'Ngoại tuyến',
  busy: 'Đang bận',
};

const statusColors: Record<string, 'green' | 'yellow' | 'orange' | 'gray'> = {
  online: 'green',
  busy: 'orange',
  offline: 'gray',
};

const renderStars = (rating: number) => {
  const safeRating = Number.isFinite(rating) ? rating : 0;
  const rounded = Math.round(safeRating * 2) / 2;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={`driver-rating-${value}`}
          size={14}
          className={value <= rounded ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
        />
      ))}
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {safeRating.toFixed(1)}
      </span>
    </div>
  );
};

export default function DriversPage() {
  const [data, setData] = useState<DriversResponse | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await adminAPI.getDrivers({
        page,
        limit: perPage,
        search,
        status: statusFilter || undefined,
      })) as DriversResponse;
      setData(response);
      setDrivers(response?.drivers || []);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError('Không thể tải dữ liệu tài xế.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [page, perPage, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDrivers();
  };

  const summary = data?.summary;

  return (
    <AdminLayout
      title="Thống kê tài xế"
      subtitle="Theo dõi hiệu suất và doanh thu tài xế"
    >
      {error && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Tổng tài xế"
          value={summary?.total_drivers || 0}
          icon={<Users />}
          color="blue"
        />
        <StatsCard
          title="Đang trực tuyến"
          value={summary?.online_drivers || 0}
          icon={<Car />}
          color="green"
        />
        <StatsCard
          title="Tổng đơn giao"
          value={(summary?.completed_orders || 0).toLocaleString('vi-VN')}
          icon={<Package />}
          color="purple"
        />
        <StatsCard
          title="Doanh thu tài xế"
          value={formatCurrency(summary?.total_earnings || 0)}
          icon={<DollarSign />}
          color="orange"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-transparent dark:border-gray-700">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="online">Trực tuyến</option>
            <option value="busy">Đang bận</option>
            <option value="offline">Ngoại tuyến</option>
          </select>

          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tên tài xế</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Số điện thoại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Đánh giá</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tổng đơn</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hoàn thành</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Doanh thu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngày tham gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    Chưa có tài xế phù hợp
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {driver.full_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {driver.phone}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={driver.status}
                        color={statusColors[driver.status] || 'gray'}
                      >
                        {statusLabels[driver.status] || driver.status}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                      {renderStars(driver.rating)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200 text-right">
                      {Number(driver.total_orders || 0).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200 text-right">
                      {Number(driver.completed_orders || 0).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100 text-right whitespace-nowrap">
                      {formatCurrency(driver.total_earnings || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {driver.created_at
                        ? new Date(driver.created_at).toLocaleDateString('vi-VN')
                        : '--'}
                    </td>
                  </tr>
                ))
              )}
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
  );
}
