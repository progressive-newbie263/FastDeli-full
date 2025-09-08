import AdminLayout from '@/components/layout/AdminLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import { getRelativeTime } from '@/lib/utils';
import type { Restaurant } from '@/lib/types';

const mockPendingRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Quán Cơm Tấm Sài Gòn',
    ownerName: 'Nguyễn Minh Tuấn',
    address: '123 Hai Bà Trưng, Q.1, TP.HCM',
    cuisine: 'Cơm Việt Nam',
    status: 'pending',
    createdAt: '2024-01-15T09:00:00Z',
    email: 'tuan@example.com',
    phone: '0901234567'
  },
  {
    id: '2',
    name: 'Bún Chả Hà Nội',
    ownerName: 'Phạm Thị Lan',
    address: '456 Trần Duy Hưng, Cầu Giấy, Hà Nội',
    cuisine: 'Món Bắc',
    status: 'pending',
    createdAt: '2024-01-14T14:30:00Z',
    email: 'lan@example.com',
    phone: '0907654321'
  },
  {
    id: '3',
    name: 'Lẩu Thái Tom Yum',
    ownerName: 'Somchai Pruksa',
    address: '789 Nguyễn Thị Minh Khai, Q.3, TP.HCM',
    cuisine: 'Ẩm thực Thái',
    status: 'pending',
    createdAt: '2024-01-13T11:20:00Z',
    email: 'somchai@example.com',
    phone: '0905432109'
  },
  {
    id: '4',
    name: 'Bánh Mì Huỳnh Hoa',
    ownerName: 'Huỳnh Văn Hoa',
    address: '26 Lê Thị Riêng, Q.1, TP.HCM',
    cuisine: 'Bánh Mì',
    status: 'pending',
    createdAt: '2024-01-13T08:15:00Z',
    email: 'hoa@example.com',
    phone: '0903216547'
  },
  {
    id: '5',
    name: 'Sushi Hokkaido',
    ownerName: 'Tanaka Hiroshi',
    address: '45 Đồng Khởi, Q.1, TP.HCM',
    cuisine: 'Nhật Bản',
    status: 'pending',
    createdAt: '2024-01-12T16:45:00Z',
    email: 'tanaka@example.com',
    phone: '0908765432'
  },
];

export default function PendingRestaurantsPage() {
  return (
    <AdminLayout 
      title="Yêu cầu nhà hàng" 
      subtitle="Phê duyệt nhà hàng mới"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl card-shadow">
          <div className="text-2xl font-bold text-orange-600 mb-2">
            {mockPendingRestaurants.length}
          </div>
          <div className="text-gray-600">Yêu cầu chờ duyệt</div>
        </div>
        <div className="bg-white p-6 rounded-xl card-shadow">
          <div className="text-2xl font-bold text-green-600 mb-2">23</div>
          <div className="text-gray-600">Đã phê duyệt tuần này</div>
        </div>
        <div className="bg-white p-6 rounded-xl card-shadow">
          <div className="text-2xl font-bold text-red-600 mb-2">7</div>
          <div className="text-gray-600">Đã từ chối tuần này</div>
        </div>
      </div>

      {/* Pending Restaurants Table */}
      <div className="bg-white rounded-xl card-shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Yêu cầu đăng ký nhà hàng</h2>
              <p className="text-gray-600 mt-1">Danh sách các nhà hàng chờ phê duyệt</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">
                Phê duyệt tất cả
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                Xuất danh sách
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên nhà hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chủ sở hữu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa chỉ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại hình
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày gửi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockPendingRestaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {restaurant.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {restaurant.ownerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{restaurant.email}</div>
                    <div className="text-gray-500">{restaurant.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="truncate" title={restaurant.address}>
                      {restaurant.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {restaurant.cuisine}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getRelativeTime(restaurant.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                      Xem chi tiết
                    </button>
                    <button className="text-green-600 hover:text-green-900 px-3 py-1 bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                      Phê duyệt
                    </button>
                    <button className="text-red-600 hover:text-red-900 px-3 py-1 bg-red-50 hover:bg-red-100 rounded-md transition-colors">
                      Từ chối
                    </button>
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