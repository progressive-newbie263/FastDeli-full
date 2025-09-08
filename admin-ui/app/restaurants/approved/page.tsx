import AdminLayout from '@/components/layout/AdminLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import { getRelativeTime } from '@/lib/utils';
import type { Restaurant } from '@/lib/types';

const mockApprovedRestaurants: Restaurant[] = [
  {
    id: '101',
    name: 'Pizza House',
    ownerName: 'Mario Rossi',
    address: '123 Nguyễn Du, Q.1, TP.HCM',
    cuisine: 'Pizza Ý',
    status: 'approved',
    createdAt: '2024-01-10T10:00:00Z',
    email: 'mario@pizzahouse.com',
    phone: '0901111111'
  },
  {
    id: '102',
    name: 'Phở Hà Nội',
    ownerName: 'Nguyễn Văn Phở',
    address: '456 Lê Lợi, Q.1, TP.HCM',
    cuisine: 'Phở Việt Nam',
    status: 'approved',
    createdAt: '2024-01-08T14:30:00Z',
    email: 'pho@hanoi.com',
    phone: '0902222222'
  },
  {
    id: '103',
    name: 'KFC Saigon',
    ownerName: 'Colonel Sanders',
    address: '789 Hai Bà Trưng, Q.3, TP.HCM',
    cuisine: 'Gà rán',
    status: 'approved',
    createdAt: '2024-01-05T09:15:00Z',
    email: 'kfc@saigon.com',
    phone: '0903333333'
  },
];

export default function ApprovedRestaurantsPage() {
  return (
    <AdminLayout 
      title="Nhà hàng đã duyệt" 
      subtitle="Danh sách nhà hàng đang hoạt động"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl card-shadow">
          <div className="text-2xl font-bold text-green-600 mb-2">156</div>
          <div className="text-gray-600">Tổng nhà hàng</div>
        </div>
        <div className="bg-white p-6 rounded-xl card-shadow">
          <div className="text-2xl font-bold text-blue-600 mb-2">142</div>
          <div className="text-gray-600">Đang hoạt động</div>
        </div>
        <div className="bg-white p-6 rounded-xl card-shadow">
          <div className="text-2xl font-bold text-orange-600 mb-2">14</div>
          <div className="text-gray-600">Tạm ngưng</div>
        </div>
        <div className="bg-white p-6 rounded-xl card-shadow">
          <div className="text-2xl font-bold text-purple-600 mb-2">23</div>
          <div className="text-gray-600">Mới tuần này</div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl card-shadow mb-6 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm">
              <option value="">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm ngưng</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại hình
            </label>
            <select className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm">
              <option value="">Tất cả loại hình</option>
              <option value="vietnamese">Việt Nam</option>
              <option value="asian">Châu Á</option>
              <option value="western">Phương Tây</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input 
              type="text" 
              placeholder="Tên nhà hàng, chủ sở hữu..."
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

      {/* Approved Restaurants Table */}
      <div className="bg-white rounded-xl card-shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Nhà hàng đã phê duyệt</h2>
              <p className="text-gray-600 mt-1">Quản lý {mockApprovedRestaurants.length} nhà hàng</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors">
                Thêm nhà hàng
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
                  Nhà hàng
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
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tham gia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockApprovedRestaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">
                            {restaurant.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {restaurant.name}
                        </div>
                        <div className="text-sm text-gray-500">ID: {restaurant.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {restaurant.ownerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{restaurant.email}</div>
                    <div>{restaurant.email}</div>
                    <div>{restaurant.phone}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {restaurant.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {restaurant.cuisine}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <StatusBadge status={restaurant.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getRelativeTime(restaurant.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button className="text-primary-600 hover:underline mr-4">
                      Xem chi tiết
                    </button>
                    <button className="text-red-600 hover:underline">
                      Gỡ
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

                  