'use client';

import React, { useEffect, useState } from 'react';
import SupplierLayout from '../components/SupplierLayout';
import { useSupplierAuth } from '../contexts/SupplierAuthContext';
import SupplierAPI from '../lib/api';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';

interface ChartData {
  date: string;
  revenue: number;
  orders_count: number;
}

interface AnalyticsStats {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

interface BestSeller {
  food_name: string;
  sold_quantity: number;
  orders_count: number;
  total_revenue: number;
}

export default function AnalyticsPage() {
  const { restaurant, isLoading: authLoading } = useSupplierAuth();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [stats, setStats] = useState<AnalyticsStats>({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
  });
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);

  useEffect(() => {
    if (authLoading) return;
    if (restaurant?.id) {
      loadAnalytics();
    }
  }, [restaurant, authLoading, timeRange]);

  const loadAnalytics = async () => {
    if (!restaurant?.id) return;

    try {
      setLoading(true);

      // Load statistics
      const statsResponse = await SupplierAPI.getStatistics(restaurant.id, timeRange);
      if (statsResponse.success && statsResponse.data) {
        const data = statsResponse.data;
        
        // Calculate stats
        const totalRevenue = data.revenue?.total || 0;
        const totalOrders = data.orders?.total_orders || 0;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        setStats({
          totalRevenue,
          totalOrders,
          avgOrderValue,
          revenueGrowth: 0, // TODO: Calculate from trend data
          ordersGrowth: 0,
        });

        // Extract chart data if available
        if (data.revenueChart) {
          setChartData(data.revenueChart);
        }

        setBestSellers(Array.isArray(data.best_sellers) ? data.best_sellers : []);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  if (loading) {
    return (
      <SupplierLayout title="Phân tích & Báo cáo" subtitle="Thống kê chi tiết về hoạt động kinh doanh">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout title="Phân tích & Báo cáo" subtitle="Thống kê chi tiết về hoạt động kinh doanh">
      {/* Time range selector */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange(7)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === 7
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            7 ngày
          </button>
          <button
            onClick={() => setTimeRange(14)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === 14
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            14 ngày
          </button>
          <button
            onClick={() => setTimeRange(30)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === 30
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            30 ngày
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <TrendingUp size={16} />
              {Math.abs(stats.revenueGrowth).toFixed(1)}%
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Tổng doanh thu</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-2">Trong {timeRange} ngày qua</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBag className="text-blue-600" size={24} />
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                stats.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <TrendingUp size={16} />
              {Math.abs(stats.ordersGrowth).toFixed(1)}%
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Tổng đơn hàng</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
          <p className="text-xs text-gray-500 mt-2">Trong {timeRange} ngày qua</p>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Giá trị đơn trung bình</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgOrderValue)}</p>
          <p className="text-xs text-gray-500 mt-2">Trung bình mỗi đơn</p>
        </div>

        {/* Performance Score */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Activity className="text-orange-600" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Hiệu suất</h3>
          <p className="text-2xl font-bold text-gray-900">85%</p>
          <p className="text-xs text-gray-500 mt-2">Tốt hơn 70% nhà hàng</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 size={20} />
              Biểu đồ doanh thu
            </h2>
            <p className="text-sm text-gray-600 mt-1">Doanh thu theo ngày trong {timeRange} ngày qua</p>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="mx-auto mb-4 text-gray-400" size={48} />
            <p>Chưa có dữ liệu biểu đồ</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chartData.map((item, index) => {
              const percentage = (item.revenue / maxRevenue) * 100;
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">{formatDate(item.date)}</span>
                    <div className="text-right">
                      <span className="text-gray-900 font-semibold">{formatCurrency(item.revenue)}</span>
                      <span className="text-gray-500 ml-2">({item.orders_count} đơn)</span>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg transition-all duration-300 flex items-center justify-end pr-3"
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 15 && (
                        <span className="text-xs text-white font-medium">{item.orders_count} đơn</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Additional insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Peak hours */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} />
            Giờ cao điểm
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">11:00 - 13:00</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: '80%' }} />
                </div>
                <span className="text-sm font-medium text-gray-900">80%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">17:00 - 19:00</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: '90%' }} />
                </div>
                <span className="text-sm font-medium text-gray-900">90%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">19:00 - 21:00</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: '65%' }} />
                </div>
                <span className="text-sm font-medium text-gray-900">65%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Popular items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart size={20} />
            Món ăn bán chạy
          </h2>
          {bestSellers.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có dữ liệu món bán chạy trong {timeRange} ngày qua.</p>
          ) : (
            <div className="space-y-3">
              {bestSellers.map((item, index) => (
                <div
                  key={`${item.food_name}-${index}`}
                  className={`flex justify-between items-center py-2 ${
                    index !== bestSellers.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-orange-600">{index + 1}</span>
                    <span className="text-gray-700">{item.food_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{item.sold_quantity} suất</span>
                    <p className="text-xs text-gray-500">{item.orders_count} đơn</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SupplierLayout>
  );
}
