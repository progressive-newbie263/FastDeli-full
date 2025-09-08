'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import StatsCard from '@/components/ui/StatsCard';
import { formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const revenueData = [
  { month: 'T1', revenue: 2200000000, orders: 12450 },
  { month: 'T2', revenue: 2400000000, orders: 13200 },
  { month: 'T3', revenue: 2100000000, orders: 11800 },
  { month: 'T4', revenue: 2600000000, orders: 14100 },
  { month: 'T5', revenue: 2800000000, orders: 15300 },
  { month: 'T6', revenue: 3200000000, orders: 16800 },
  { month: 'T7', revenue: 3500000000, orders: 18200 },
  { month: 'T8', revenue: 3300000000, orders: 17600 },
  { month: 'T9', revenue: 3700000000, orders: 19400 },
  { month: 'T10', revenue: 3900000000, orders: 20100 },
  { month: 'T11', revenue: 4100000000, orders: 21500 },
  { month: 'T12', revenue: 4300000000, orders: 22800 },
];

const topRestaurants = [
  { name: 'Pizza House', orders: 1250, revenue: 850000000 },
  { name: 'KFC Saigon', orders: 1180, revenue: 780000000 },
  { name: 'Phở Hà Nội', orders: 980, revenue: 520000000 },
  { name: 'Gà Rán Seoul', orders: 860, revenue: 640000000 },
  { name: 'Bún Bò Huế', orders: 720, revenue: 380000000 },
];

const orderStatusData = [
  { name: 'Hoàn thành', value: 65, color: '#10B981' },
  { name: 'Đang xử lý', value: 20, color: '#F59E0B' },
  { name: 'Đã hủy', value: 10, color: '#EF4444' },
  { name: 'Mới', value: 5, color: '#6366F1' },
];

const dailyOrdersData = [
  { day: 'T2', orders: 145 },
  { day: 'T3', orders: 132 },
  { day: 'T4', orders: 168 },
  { day: 'T5', orders: 189 },
  { day: 'T6', orders: 234 },
  { day: 'T7', orders: 267 },
  { day: 'CN', orders: 198 },
];

export default function AnalyticsPage() {
  return (
    <AdminLayout 
      title="Báo cáo & Thống kê" 
      subtitle="Phân tích dữ liệu và xu hướng kinh doanh"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Doanh thu tháng này"
          value={formatCurrency(4300000000)}
          trend="+12.5% so với tháng trước"
          trendType="up"
          icon="💰"
          color="green"
        />
        <StatsCard
          title="Đơn hàng tháng này"
          value="22,800"
          trend="+8.3% so với tháng trước"
          trendType="up"
          icon="📦"
          color="blue"
        />
        <StatsCard
          title="Đơn hàng trung bình/ngày"
          value="760"
          trend="+15.2% so với tháng trước"
          trendType="up"
          icon="📊"
          color="purple"
        />
        <StatsCard
          title="Giá trị đơn hàng TB"
          value={formatCurrency(188500)}
          trend="+3.8% so với tháng trước"
          trendType="up"
          icon="💵"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl card-shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Doanh thu theo tháng</h2>
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickFormatter={(value) => `${value/1000000000}B`}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), 'Doanh thu']}
                  labelStyle={{ color: '#374151' }}
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
        <div className="bg-white rounded-xl card-shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Đơn hàng theo ngày trong tuần</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyOrdersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  formatter={(value) => [value, 'Đơn hàng']}
                  labelStyle={{ color: '#374151' }}
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
        <div className="bg-white rounded-xl card-shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Phân bố trạng thái đơn hàng</h2>
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
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
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
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Restaurants */}
        <div className="lg:col-span-2 bg-white rounded-xl card-shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Top nhà hàng theo doanh thu</h2>
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option>Tháng này</option>
              <option>Tuần này</option>
              <option>Hôm nay</option>
            </select>
          </div>
          <div className="space-y-4">
            {topRestaurants.map((restaurant, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-semibold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{restaurant.name}</div>
                    <div className="text-sm text-gray-500">
                      {restaurant.orders} đơn hàng
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(restaurant.revenue)}
                  </div>
                  <div className="text-sm text-gray-500">
                    TB: {formatCurrency(restaurant.revenue / restaurant.orders)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-xl card-shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Hoạt động gần đây</h2>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-blue-600 text-lg">📊</span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Báo cáo doanh thu tháng 12 đã được tạo</div>
              <div className="text-sm text-gray-500">2 giờ trước</div>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-green-600 text-lg">📈</span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Doanh thu đã vượt mục tiêu tháng 15%</div>
              <div className="text-sm text-gray-500">1 ngày trước</div>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-purple-50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-purple-600 text-lg">🏪</span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">5 nhà hàng mới đã tham gia hệ thống</div>
              <div className="text-sm text-gray-500">3 ngày trước</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}