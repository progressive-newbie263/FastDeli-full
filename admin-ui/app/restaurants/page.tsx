'use client';

import { useState, useEffect, useReducer } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import ApiService from '@/lib/api';
import type { Restaurant } from '@/app/types/admin';
import { useRouter } from 'next/navigation';

export default function RestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    fetchRestaurants();
  }, [filter, currentPage, perPage]);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      
      const filters: any = {};
      if (filter !== 'all') {
        filters.status = filter;
      }

      const response = await ApiService.getRestaurants(currentPage, perPage, filters);
      
      if (response.success) {
        setRestaurants(response.data.restaurants);
        setTotalPages(response.data.pagination.total_pages);
        setTotalItems(response.data.pagination.total_items);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const response = await ApiService.updateRestaurantStatus(id.toString(), newStatus);
      
      if (response.success) {
        fetchRestaurants(); 
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setCurrentPage(1); // Reset về trang 1
  };

  const handleViewRestaurantDetails = (id: number) => {
    router.push(`/restaurants/${id}`);
  }

  return (
    <AdminLayout 
      title="Quản lý nhà hàng" 
      subtitle="Quản lý các nhà hàng trong hệ thống"
    >
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'inactive', 'pending', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setCurrentPage(1); // Reset về trang 1 khi đổi filter
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/15 border border-gray-200 dark:border-white/10'
              }`}
            >
              {status === 'all' ? 'Tất cả' : 
               status === 'active' ? 'Đang hoạt động' : 
               status === 'inactive' ? 'Tạm dừng' :
               status === 'pending' ? 'Chờ duyệt' :
               'Từ chối'}
            </button>
          ))}
        </div>

        {/* Items per page selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">Hiển thị:</span>
          <select
            value={perPage}
            onChange={(e) => handlePerPageChange(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl card-shadow overflow-hidden border border-transparent dark:border-gray-700">
        <div className="overflow-hidden">
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="w-[26%] px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nhà hàng
                </th>
                <th className="w-[18%] px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Địa chỉ
                </th>
                <th className="w-[12%] px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="w-[12%] px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Đánh giá
                </th>
                <th className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="w-[12%] px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                    Đang tải...
                  </td>
                </tr>
              ) : restaurants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                    Không có nhà hàng nào
                  </td>
                </tr>
              ) : (
                restaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-3 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={restaurant.image_url || '/placeholder-restaurant.jpg'}
                            alt={restaurant.name}
                          />
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={restaurant.name}>
                            {restaurant.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={restaurant.description}>
                            {restaurant.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2" title={restaurant.address}>
                        {restaurant.address}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <div className="break-words">{restaurant.phone}</div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-1">
                          <span>⭐</span>
                          <span className="font-medium">{restaurant.rating || 0}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {restaurant.total_reviews || 0} đánh giá
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <StatusBadge 
                        status={restaurant.status}
                        color={
                          restaurant.status === "active" ? 'green' : 
                          restaurant.status === "pending" ? 'yellow' :
                          restaurant.status === "rejected" ? 'red' : 'gray'
                        }
                      >
                        {restaurant.status === "active" ? 'Hoạt động' : 
                         restaurant.status === "pending" ? 'Chờ duyệt' :
                         restaurant.status === "rejected" ? 'Từ chối' : 'Tạm dừng'}
                      </StatusBadge>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="whitespace-nowrap">{new Date(restaurant.created_at).toLocaleDateString('vi-VN')}</div>
                    </td>
                    <td className="px-3 py-4 text-sm font-medium">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleToggleActive(restaurant.id, restaurant.status)}
                          className={`text-left whitespace-nowrap ${
                            restaurant.status === "active" 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {restaurant.status === "active" ? 'Tạm dừng' : 'Kích hoạt'}
                        </button>
                        <button 
                          className="text-left text-blue-600 hover:text-blue-900 whitespace-nowrap cursor-pointer"
                          onClick={() =>handleViewRestaurantDetails(restaurant.id)}
                        >
                          Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-xl card-shadow p-8 text-center text-gray-500">
            Đang tải...
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-white rounded-xl card-shadow p-8 text-center text-gray-500">
            Không có nhà hàng nào
          </div>
        ) : (
          restaurants.map((restaurant) => (
            <div key={restaurant.id} className="bg-white rounded-xl card-shadow overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <img
                    className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                    src={restaurant.image_url || '/placeholder-restaurant.jpg'}
                    alt={restaurant.name}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {restaurant.description}
                    </p>
                    <StatusBadge 
                      status={restaurant.status}
                      color={
                        restaurant.status === "active" ? 'green' : 
                        restaurant.status === "pending" ? 'yellow' :
                        restaurant.status === "rejected" ? 'red' : 'gray'
                      }
                    >
                      {restaurant.status === "active" ? 'Hoạt động' : 
                       restaurant.status === "pending" ? 'Chờ duyệt' :
                       restaurant.status === "rejected" ? 'Từ chối' : 'Tạm dừng'}
                    </StatusBadge>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 text-sm mt-0.5">📍</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 mb-0.5">Địa chỉ</p>
                    <p className="text-sm text-gray-900">{restaurant.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">📞</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-0.5">Liên hệ</p>
                    <p className="text-sm text-gray-900">{restaurant.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Đánh giá</p>
                    <div className="flex items-center gap-1">
                      <span>⭐</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {restaurant.rating || 0}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({restaurant.total_reviews || 0})
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Ngày tạo</p>
                    <p className="text-sm text-gray-900">
                      {new Date(restaurant.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => handleToggleActive(restaurant.id, restaurant.status)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    restaurant.status === "active" 
                      ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {restaurant.status === "active" ? 'Tạm dừng' : 'Kích hoạt'}
                </button>
                <button className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl card-shadow p-4">
          <div className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">{(currentPage - 1) * perPage + 1}</span> đến{' '}
            <span className="font-medium">
              {Math.min(currentPage * perPage, totalItems)}
            </span>{' '}
            trong tổng số <span className="font-medium">{totalItems}</span> nhà hàng
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Trước
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first, last, current, and adjacent pages
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="px-2 py-1.5 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}