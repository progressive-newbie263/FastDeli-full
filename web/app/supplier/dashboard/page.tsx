'use client';

import React, { useEffect, useState } from 'react';
import SupplierLayout from '../components/SupplierLayout';
import { useSupplierAuth } from '../contexts/SupplierAuthContext';
import SupplierAPI from '../lib/api';
import type { SupplierStats, Order } from '../types';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  UtensilsCrossed,
  Star,
  Clock,
  CheckCircle,
} from 'lucide-react';

export default function SupplierDashboard() {
  const { restaurant, isLoading: authLoading } = useSupplierAuth();
  const [stats, setStats] = useState<SupplierStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Chờ auth loading xong trước
    if (authLoading) {
      return;
    }

    if (restaurant?.id) {
      loadDashboardData();
    } else {
      // Restaurant chưa load hoặc không tồn tại
      setLoading(false);
    }
  }, [restaurant, authLoading]);

  const loadDashboardData = async () => {
    if (!restaurant?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch statistics
      const statsResponse = await SupplierAPI.getStatistics(restaurant.id);
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      // Fetch recent orders
      const ordersResponse = await SupplierAPI.getMyOrders(restaurant.id, 1, 5);
      if (ordersResponse.success && ordersResponse.data) {
        setRecentOrders(ordersResponse.data.orders || []);
      }
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOrderStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800' },
      processing: { label: 'Đang chuẩn bị', className: 'bg-purple-100 text-purple-800' },
      delivering: { label: 'Đang giao', className: 'bg-indigo-100 text-indigo-800' },
      delivered: { label: 'Đã giao', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <SupplierLayout title="Dashboard" subtitle="Tổng quan hoạt động nhà hàng">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </SupplierLayout>
    );
  }

  if (error) {
    return (
      <SupplierLayout title="Dashboard" subtitle="Tổng quan hoạt động nhà hàng">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <div className="text-red-400 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Không thể tải dữ liệu</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout title="Dashboard" subtitle="Tổng quan hoạt động nhà hàng">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
            {stats?.revenueTrend !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${stats.revenueTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.revenueTrend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{Math.abs(stats.revenueTrend)}%</span>
              </div>
            )}
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Tổng doanh thu</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.totalRevenue || 0)}</p>
          <p className="text-xs text-gray-500 mt-2">Hôm nay: {formatCurrency(stats?.todayRevenue || 0)}</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBag className="text-blue-600" size={24} />
            </div>
            {stats?.ordersTrend !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${stats.ordersTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.ordersTrend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{Math.abs(stats.ordersTrend)}%</span>
              </div>
            )}
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Tổng đơn hàng</h3>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Hôm nay: {stats?.todayOrders || 0} đơn</p>
        </div>

        {/* Total Foods */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <UtensilsCrossed className="text-purple-600" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Món ăn</h3>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalFoods || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Đang bán</p>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="text-yellow-600" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Đánh giá trung bình</h3>
          <p className="text-2xl font-bold text-gray-900">{stats?.avgRating?.toFixed(1) || '0.0'}</p>
          <p className="text-xs text-gray-500 mt-2">⭐⭐⭐⭐⭐</p>
        </div>
      </div>

      {/* Pending Orders Alert */}
      {stats && stats.pendingOrders > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8 flex items-center gap-3">
          <Clock className="text-orange-600" size={24} />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900">Có {stats.pendingOrders} đơn hàng chờ xác nhận</h3>
            <p className="text-sm text-orange-700">Vui lòng xác nhận đơn hàng để khách hàng không phải chờ lâu</p>
          </div>
          <a
            href="/supplier/orders?status=pending"
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Xem ngay
          </a>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Đơn hàng gần đây</h2>
            <a
              href="/supplier/orders"
              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              Xem tất cả →
            </a>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ShoppingBag className="mx-auto mb-3 text-gray-400" size={48} />
              <p>Chưa có đơn hàng nào</p>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.order_id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">#{order.order_code}</h3>
                    <p className="text-sm text-gray-600">
                      {order.customer_name} • {order.customer_phone}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 mb-2">
                      {formatCurrency(order.total_amount)}
                    </p>
                    {getOrderStatusBadge(order.order_status)}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UtensilsCrossed size={16} />
                  <span>{order.items?.length || 0} món</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <a
          href="/supplier/orders?status=pending"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Đơn chờ xác nhận</h3>
              <p className="text-sm text-gray-600">Xem và xác nhận đơn hàng mới</p>
            </div>
          </div>
        </a>

        <a
          href="/supplier/menu"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <UtensilsCrossed className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Quản lý thực đơn</h3>
              <p className="text-sm text-gray-600">Thêm, sửa món ăn</p>
            </div>
          </div>
        </a>

        <a
          href="/supplier/settings"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Cài đặt nhà hàng</h3>
              <p className="text-sm text-gray-600">Cập nhật thông tin</p>
            </div>
          </div>
        </a>
      </div>
    </SupplierLayout>
  );
}
