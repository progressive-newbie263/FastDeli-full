import AdminLayout from '@/components/layout/AdminLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCurrency, getRelativeTime } from '@/lib/utils';
import type { User } from '@/lib/types';

const mockUsers: User[] = [
  {
    id: 'U001',
    name: 'Nguyễn Minh Anh',
    email: 'minh.anh@gmail.com',
    phone: '0901234567',
    role: 'customer',
    status: 'active',
    createdAt: '2024-01-10T10:00:00Z',
    lastLogin: '2024-01-15T09:30:00Z',
    totalOrders: 23,
    totalSpent: 2450000
  },
  {
    id: 'U002',
    name: 'Trần Văn Hùng',
    email: 'hung.tran@gmail.com',
    phone: '0907654321',
    role: 'customer',
    status: 'active',
    createdAt: '2024-01-08T14:30:00Z',
    lastLogin: '2024-01-15T08:15:00Z',
    totalOrders: 15,
    totalSpent: 1230000
  },
  {
    id: 'U003',
    name: 'Lê Thị Mai',
    email: 'mai.le@gmail.com',
    phone: '0909876543',
    role: 'customer',
    status: 'active',
    createdAt: '2024-01-05T16:20:00Z',
    lastLogin: '2024-01-14T19:45:00Z',
    totalOrders: 31,
    totalSpent: 3850000
  },
  {
    id: 'R001',
    name: 'Mario Rossi',
    email: 'mario@pizzahouse.com',
    phone: '0901111111',
    role: 'restaurant_owner',
    status: 'active',
    createdAt: '2024-01-01T09:00:00Z',
    lastLogin: '2024-01-15T07:30:00Z',
    totalOrders: 156
  },
  {
    id: 'U004',
    name: 'Phạm Thị Lan',
    email: 'lan.pham@gmail.com',
    phone: '0905432109',
    role: 'customer',
    status: 'inactive',
    createdAt: '2023-12-20T11:15:00Z',
    lastLogin: '2024-01-05T14:20:00Z',
    totalOrders: 8,
    totalSpent: 650000
  },
  {
    id: 'U005',
    name: 'Hoàng Văn Đức',
    email: 'duc.hoang@gmail.com',
    phone: '0903216547',
    role: 'customer',
    status: 'banned',
    createdAt: '2023-12-15T08:30:00Z',
    lastLogin: '2024-01-10T12:00:00Z',
    totalOrders: 5,
    totalSpent: 320000
  },
];

const userStats = {
  totalUsers: 8945,
  activeUsers: 8231,
  inactiveUsers: 567,
  bannedUsers: 147,
  newUsersThisMonth: 234,
  customerUsers: 8642,
  restaurantOwners: 156,
  adminUsers: 3
};

export default function UsersPage() {
  return (
    <AdminLayout 
      title="Quản lý người dùng" 
      subtitle="Quản lý tài khoản khách hàng và chủ nhà hàng"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl card-shadow">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {userStats.totalUsers.toLocaleString()}
          </div>
          <div className="text-gray-600">Tổng người dùng</div>
        </div>
        <div className="bg-white p-6 rounded-xl card-shadow">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {userStats.activeUsers.toLocaleString()}
          </div>
          <div className="text-gray-600">Đang hoạt động</div>
        </div>
        <div className="bg-white p-6 rounded-xl card-shadow">
          <div className="text-2xl font-bold text-orange-600 mb-2">
            {userStats.inactiveUsers}
          </div>
          <div className="text-gray-600">Không hoạt động</div>
        </div>
        <div className="bg-white p-6 rounded-xl card-shadow">
          <div className="text-2xl font-bold text-purple-600 mb-2">
            {userStats.newUsersThisMonth}
          </div>
          <div className="text-gray-600">Mới tháng này</div>
        </div>
      </div>

      {/* User Type Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900 mb-1">
                {userStats.customerUsers.toLocaleString()}
              </div>
              <div className="text-gray-600">Khách hàng</div>
            </div>
            <div className="text-3xl">👤</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900 mb-1">
                {userStats.restaurantOwners}
              </div>
              <div className="text-gray-600">Chủ nhà hàng</div>
            </div>
            <div className="text-3xl">🏪</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900 mb-1">
                {userStats.adminUsers}
              </div>
              <div className="text-gray-600">Quản trị viên</div>
            </div>
            <div className="text-3xl">⚙️</div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl card-shadow mb-6 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vai trò
            </label>
            <select className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm">
              <option value="">Tất cả vai trò</option>
              <option value="customer">Khách hàng</option>
              <option value="restaurant_owner">Chủ nhà hàng</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm">
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="banned">Bị cấm</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input 
              type="text" 
              placeholder="Tên, email, số điện thoại..."
              className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm w-64"
            />
          </div>
          <div className="flex items-end">
            <button className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors text-sm">
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl card-shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Danh sách người dùng</h2>
              <p className="text-gray-600 mt-1">Quản lý {mockUsers.length} người dùng</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors">
                Thêm người dùng
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                Xuất Excel
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lần đăng nhập cuối
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng chi tiêu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  {/* Cột người dùng */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">ID: {user.id}</div>
                  </td>
                  {/* Cột liên hệ */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div>{user.email}</div>
                    <div className="text-xs text-gray-500">{user.phone}</div>
                  </td>
                  {/* Cột vai trò */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                    {user.role === 'customer' && 'Khách hàng'}
                    {user.role === 'restaurant_owner' && 'Chủ nhà hàng'}
                    {user.role === 'admin' && 'Quản trị viên'}
                  </td>
                  {/* Cột trạng thái */}
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={user.status} />
                  </td> */}
                  {/* Cột ngày tạo */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  {/* Cột lần đăng nhập cuối */}
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {getRelativeTime(user.lastLogin)}
                  </td> */}
                  {/* Cột đơn hàng */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {user.totalOrders ?? '-'}
                  </td>
                  {/* Cột tổng chi tiêu */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {user.totalSpent ? formatCurrency(user.totalSpent) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}