'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import StatsCard from '@/components/ui/StatsCard';
import { formatCurrency } from '@/lib/utils';
import { adminAPI } from '@/app/utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

type Period = 'today' | 'week' | 'month';

type RevenueByMonth = { month: string; revenue: number; orders: number };
type OrdersByWeekday = { day: string; orders: number };
type OrderStatus = { name: string; value: number; color: string };
type TopRestaurant = { name: string; orders: number; revenue: number };
type RecentActivity = { kind: string; title: string; time: string };

type AnalyticsResponse = {
  metrics: {
    monthRevenue: number;
    monthRevenueTrend: number;
    monthOrders: number;
    monthOrdersTrend: number;
    avgOrdersPerDay: number;
    avgOrdersPerDayTrend: number;
    avgOrderValue: number;
    avgOrderValueTrend: number;
  };
  revenueByMonth: RevenueByMonth[];
  ordersByWeekday: OrdersByWeekday[];
  orderStatus: OrderStatus[];
  topRestaurants: TopRestaurant[];
  recentActivity: RecentActivity[];
};

export default function AnalyticsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [topPeriod, setTopPeriod] = useState<Period>('month');
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = (await adminAPI.getAnalytics({ year: selectedYear, period: topPeriod })) as AnalyticsResponse;

        if (!cancelled) setData(res);
      } catch (e) {
        console.error('[analytics] Error:', e);
        if (!cancelled) setError(e instanceof Error ? e.message : 'Không thể tải dữ liệu thống kê');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => {
      cancelled = true;
    };
  }, [selectedYear, topPeriod]);

  const metrics = data?.metrics;
  
  // ✅ Parse revenue về number để Recharts vẽ đúng
  const revenueData = useMemo<RevenueByMonth[]>(
    () => {
      const raw = data?.revenueByMonth ?? [];
      return raw.map((item) => ({
        month: item.month,
        revenue: typeof item.revenue === 'number' ? item.revenue : parseFloat(String(item.revenue ?? 0)),
        orders: typeof item.orders === 'number' ? item.orders : parseInt(String(item.orders ?? 0), 10),
      }));
    },
    [data]
  );

  const dailyOrdersData = useMemo<OrdersByWeekday[]>(
    () => data?.ordersByWeekday ?? [],
    [data]
  );
  
  const orderStatusData = useMemo<OrderStatus[]>(
    () => data?.orderStatus ?? [],
    [data]
  );
  
  const topRestaurants = useMemo<TopRestaurant[]>(
    () => data?.topRestaurants ?? [],
    [data]
  );
  
  const recentActivity = useMemo<RecentActivity[]>(
    () => data?.recentActivity ?? [],
    [data]
  );

  const formatTrend = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value}% so với tháng trước`;
  };

  return (
    <AdminLayout 
      title="Báo cáo & Thống kê" 
      subtitle="Phân tích dữ liệu và xu hướng kinh doanh"
    >
      {error && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ Không thể tải dữ liệu thống kê: {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Doanh thu tháng này"
          value={formatCurrency(metrics?.monthRevenue || 0)}
          trend={metrics ? formatTrend(metrics.monthRevenueTrend) : undefined}
          trendType={metrics && metrics.monthRevenueTrend >= 0 ? 'up' : 'down'}
          icon="💰"
          color="green"
        />
        <StatsCard
          title="Đơn hàng tháng này"
          value={(metrics?.monthOrders || 0).toLocaleString('vi-VN')}
          trend={metrics ? formatTrend(metrics.monthOrdersTrend) : undefined}
          trendType={metrics && metrics.monthOrdersTrend >= 0 ? 'up' : 'down'}
          icon="📦"
          color="blue"
        />
        <StatsCard
          title="Đơn hàng trung bình/ngày"
          value={(metrics?.avgOrdersPerDay || 0).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}
          trend={metrics ? formatTrend(metrics.avgOrdersPerDayTrend) : undefined}
          trendType={metrics && metrics.avgOrdersPerDayTrend >= 0 ? 'up' : 'down'}
          icon="📊"
          color="purple"
        />
        <StatsCard
          title="Giá trị đơn hàng TB"
          value={formatCurrency(metrics?.avgOrderValue || 0)}
          trend={metrics ? formatTrend(metrics.avgOrderValueTrend) : undefined}
          trendType={metrics && metrics.avgOrderValueTrend >= 0 ? 'up' : 'down'}
          icon="💵"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl card-shadow p-6 border border-transparent dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Doanh thu theo tháng</h2>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />

                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280" 
                  fontSize={12}
                  className="dark:stroke-gray-400"
                />
                
                {/* ✅ YAxis tự động scale, không hardcode domain */}
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  className="dark:stroke-gray-400"
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                    return value.toString();
                  }}
                />

                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), 'Doanh thu']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 600 }}
                />

                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Orders Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl card-shadow p-6 border border-transparent dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Đơn hàng theo ngày trong tuần</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyOrdersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="day" 
                  stroke="#6b7280" 
                  fontSize={12}
                  className="dark:stroke-gray-400"
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  className="dark:stroke-gray-400"
                />
                <Tooltip 
                  formatter={(value) => [value, 'Đơn hàng']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 600 }}
                />
                <Bar 
                  dataKey="orders" 
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl card-shadow p-6 border border-transparent dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Phân bố trạng thái đơn hàng</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Tỷ lệ']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {orderStatusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Restaurants */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl card-shadow p-6 border border-transparent dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Top nhà hàng theo doanh thu</h2>
            <select
              value={topPeriod}
              onChange={(e) => setTopPeriod(e.target.value as Period)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="month">Tháng này</option>
              <option value="week">Tuần này</option>
              <option value="today">Hôm nay</option>
            </select>
          </div>
          <div className="space-y-4">
            {topRestaurants.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {loading ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu nhà hàng'}
              </div>
            ) : (
              topRestaurants.map((restaurant, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{restaurant.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {restaurant.orders} đơn hàng
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(restaurant.revenue)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      TB: {formatCurrency(restaurant.orders > 0 ? restaurant.revenue / restaurant.orders : 0)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl card-shadow p-6 border border-transparent dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Hoạt động gần đây</h2>
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {loading ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu hoạt động'}
            </div>
          ) : (
            recentActivity.slice(0, 5).map((item, idx) => {
              const style =
                item.kind === 'revenue'
                  ? { bg: 'bg-green-50 dark:bg-green-900/20', iconBg: 'bg-green-100 dark:bg-green-900/30', icon: '📈', iconText: 'text-green-600 dark:text-green-400' }
                  : item.kind === 'restaurants'
                    ? { bg: 'bg-purple-50 dark:bg-purple-900/20', iconBg: 'bg-purple-100 dark:bg-purple-900/30', icon: '🏪', iconText: 'text-purple-600 dark:text-purple-400' }
                    : { bg: 'bg-blue-50 dark:bg-blue-900/20', iconBg: 'bg-blue-100 dark:bg-blue-900/30', icon: '📊', iconText: 'text-blue-600 dark:text-blue-400' };

              return (
                <div key={idx} className={`flex items-center p-4 ${style.bg} rounded-lg hover:shadow-sm transition-shadow`}>
                  <div className={`flex-shrink-0 w-10 h-10 ${style.iconBg} rounded-full flex items-center justify-center mr-4`}>
                    <span className={`${style.iconText} text-lg`}>{style.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{item.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.time}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}