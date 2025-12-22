'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import StatsCard from '@/components/ui/StatsCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatCurrency, getRelativeTime } from '@/lib/utils';
import { adminAPI, APIError } from '@/app/utils/api';
import type { DashboardStats, RecentOrder } from '@/app/types/admin';

export default function DashboardAdmin() {
  // State management
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Fetch dashboard data
   */
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // giới hạn 1 số order gần đây - số lượng là 5.
      const [statsData, ordersData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getRecentOrders(5),
      ]);

      /*
        * Debug log (confirm, check thành công và đúng)
        * console.log('Stats data:', statsData); 
        * console.log('Orders data:', ordersData); 
      */

      setStats(statsData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      
      if (err instanceof APIError) {
        setError(`Error ${err.status}: ${err.message}`);
      } else {
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /**
   * Refresh handler
   */
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  /**
   * Loading state
   */
  if (loading) {
    return (
      <ProtectedRoute>
        <AdminLayout title="Dashboard" subtitle="Đang tải...">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  /**
   * Error state
   */
  if (error && !stats) {
    return (
      <ProtectedRoute>
        <AdminLayout title="Dashboard" subtitle="Lỗi">
          <div className="max-w-2xl mx-auto mt-10">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>

                <div className="flex-1">
                  <h3 className="text-red-800 font-semibold mb-2">Không thể tải dữ liệu</h3>
                  
                  <p className="text-red-700 text-sm mb-4">{error}</p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                      {refreshing ? 'Đang thử lại...' : 'Thử lại'}
                    </button>

                    <a href="/" className="px-4 py-2 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition">
                      Về trang chủ
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  /**
   * Success state
   */
  return (
    <ProtectedRoute>
      <AdminLayout title="Dashboard" subtitle="Tổng quan hệ thống FoodDeli">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-500">
            Cập nhật lần cuối: {new Date().toLocaleTimeString('vi-VN')}
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <svg 
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            {refreshing ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>

        {/* báo lỗi nếu dữ liệu caching có vấn đề gì đó */}
        {error && stats && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-yellow-700 text-sm">
              ⚠️ Không thể tải dữ liệu mới nhất. Hiển thị dữ liệu cache.
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Tổng đơn hàng"
            value={stats.totalOrders?.toLocaleString() || '0'}
            trend={stats.ordersTrend ? `${stats.ordersTrend > 0 ? '+' : ''}${stats.ordersTrend}%` : undefined}
            icon="📦"
            color="blue"
          />
          
          <StatsCard
            title="Doanh thu"
            value={formatCurrency(stats.totalRevenue || 0)}
            icon="💰"
            color="green"
          />
          
          {/* ✅ Safe access với Optional Chaining */}
          <StatsCard
            title="Nhà hàng hoạt động"
            value={stats.activeRestaurants?.toString() || 'N/A'}
            icon="🏪"
            color="purple"
          />
          
          <StatsCard
            title="Người dùng"
            value={stats.totalUsers?.toLocaleString() || '0'}
            icon="👥"
            color="orange"
          />
        </div>

        {/* Today Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl card-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Doanh thu hôm nay</h3>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {formatCurrency(stats?.todayRevenue || 0)}
                </div>
                <p className="text-gray-600 text-sm">Từ các đơn đã giao</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">💵</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl card-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cần xử lý</h3>
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {stats?.pendingOrders || 0}
                </div>
                <p className="text-gray-600 text-sm">Đơn hàng chờ xác nhận</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl card-shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Đơn hàng gần đây</h2>
              <a href="/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Xem tất cả →
              </a>
            </div>
          </div>
          <div className="p-6">
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.order_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          #{order.order_code}
                        </span>

                        {/* kiểm tra kĩ status đoạn này ? */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.order_status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          order.order_status === 'processing' ? 'bg-orange-100 text-orange-700' :
                          order.order_status === 'delivering' ? 'bg-indigo-100 text-indigo-700' :
                          order.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.order_status === 'cancelled' ? 'bg-red-500 text-white' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {
                            order.order_status === 'pending' ? 'Chờ xác nhận' :
                            order.order_status === 'confirmed' ? 'Đã xác nhận' :
                            order.order_status === 'processing' ? 'Đang chuẩn bị' :
                            order.order_status === 'delivering' ? 'Đang giao' :
                            order.order_status === 'delivered' ? 'Đã giao' :
                            order.order_status === 'cancelled' ? 'Đã hủy' :
                            'Đã hủy'
                          }
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {order.customer_name} • {order.restaurant_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getRelativeTime(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </div>
                      <div className={`text-xs ${
                        order.payment_status === 'paid' ? 'text-green-600' :
                        order.payment_status === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {order.payment_status === 'paid' ? '✓ Đã thanh toán' :
                         order.payment_status === 'pending' ? '⏳ Chưa thanh toán' :
                         '✗ Thất bại'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}