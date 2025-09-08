import AdminLayout from '@/components/layout/AdminLayout';
import StatsCard from '@/components/ui/StatsCard';
import { formatCurrency, getRelativeTime } from '@/lib/utils';
import type { DashboardStats, Order } from '@/lib/types';

const mockStats: DashboardStats = {
  totalOrders: 15420,
  totalRevenue: 2840500000,
  totalRestaurants: 156,
  totalUsers: 8945,
  pendingOrders: 23,
  pendingRestaurants: 5,
  todayOrders: 145,
  todayRevenue: 18500000,
  ordersTrend: 12.5,
  revenueTrend: 8.2,
  restaurantsTrend: 15.3,
  usersTrend: 9.8,
};

const recentOrders: Order[] = [
  {
    id: 'FD001240',
    customerName: 'Nguyễn Minh Anh',
    customerId: 'U001',
    restaurantName: 'Pizza House',
    restaurantId: 'R001',
    totalAmount: 320000,
    status: 'new',
    createdAt: '2024-01-15T11:30:00Z',
    deliveryAddress: '123 Nguyễn Du, Q.1, TP.HCM',
    paymentMethod: 'card',
    paymentStatus: 'pending',
    items: []
  },
  {
    id: 'FD001239',
    customerName: 'Trần Văn Hùng',
    customerId: 'U002',
    restaurantName: 'Phở Hà Nội',
    restaurantId: 'R002',
    totalAmount: 95000,
    status: 'processing',
    createdAt: '2024-01-15T11:15:00Z',
    deliveryAddress: '456 Lê Lợi, Q.1, TP.HCM',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    items: []
  },
  {
    id: 'FD001238',
    customerName: 'Lê Thị Mai',
    customerId: 'U003',
    restaurantName: 'KFC',
    restaurantId: 'R003',
    totalAmount: 280000,
    status: 'delivering',
    createdAt: '2024-01-15T11:00:00Z',
    deliveryAddress: '789 Hai Bà Trưng, Q.3, TP.HCM',
    paymentMethod: 'wallet',
    paymentStatus: 'paid',
    items: []
  },
];

export default function DashboardPage() {
  return (
    <AdminLayout 
      title="Dashboard" 
      subtitle="Tổng quan hệ thống FoodDeli"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Tổng đơn hàng"
          value={mockStats.totalOrders.toLocaleString()}
          trend={`+${mockStats.ordersTrend}% so với tháng trước`}
          trendType="up"
          icon="📦"
          color="blue"
        />
        <StatsCard
          title="Doanh thu"
          value={formatCurrency(mockStats.totalRevenue)}
          trend={`+${mockStats.revenueTrend}% so với tháng trước`}
          trendType="up"
          icon="💰"
          color="green"
        />
        <StatsCard
          title="Nhà hàng"
          value={mockStats.totalRestaurants}
          trend={`+${mockStats.restaurantsTrend}% so với tháng trước`}
          trendType="up"
          icon="🏪"
          color="purple"
        />
        <StatsCard
          title="Người dùng"
          value={mockStats.totalUsers.toLocaleString()}
          trend={`+${mockStats.usersTrend}% so với tháng trước`}
          trendType="up"
          icon="👥"
          color="orange"
        />
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl card-shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hôm nay</h3>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {mockStats.todayOrders}
              </div>
              <p className="text-gray-600 text-sm">Đơn hàng mới</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl card-shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Doanh thu hôm nay</h3>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatCurrency(mockStats.todayRevenue)}
              </div>
              <p className="text-gray-600 text-sm">Tăng 15% so với hôm qua</p>
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
                {mockStats.pendingOrders + mockStats.pendingRestaurants}
              </div>
              <p className="text-gray-600 text-sm">
                {mockStats.pendingOrders} đơn hàng, {mockStats.pendingRestaurants} nhà hàng
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        #{order.id}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'new' ? 'bg-teal-100 text-teal-700' :
                        order.status === 'processing' ? 'bg-orange-100 text-orange-700' :
                        order.status === 'delivering' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {order.status === 'new' ? 'Mới' :
                         order.status === 'processing' ? 'Đang xử lý' :
                         order.status === 'delivering' ? 'Đang giao' : 'Hoàn thành'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {order.customerName} • {order.restaurantName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getRelativeTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl card-shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Thao tác nhanh</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <a href="/orders" className="group p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="text-2xl mb-2">📦</div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-700">
                  Quản lý đơn hàng
                </h3>
                <p className="text-sm text-gray-600">
                  {mockStats.pendingOrders} đơn cần xử lý
                </p>
              </a>

              <a href="/restaurants/pending" className="group p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="text-2xl mb-2">🏪</div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-700">
                  Duyệt nhà hàng
                </h3>
                <p className="text-sm text-gray-600">
                  {mockStats.pendingRestaurants} yêu cầu mới
                </p>
              </a>

              <a href="/users" className="group p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="text-2xl mb-2">👥</div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-700">
                  Người dùng
                </h3>
                <p className="text-sm text-gray-600">
                  {mockStats.totalUsers.toLocaleString()} tài khoản
                </p>
              </a>

              <a href="/analytics" className="group p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-700">
                  Báo cáo
                </h3>
                <p className="text-sm text-gray-600">
                  Thống kê & phân tích
                </p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}