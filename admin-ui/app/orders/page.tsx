import AdminLayout from '@/components/layout/AdminLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCurrency, getRelativeTime } from '@/lib/utils';
import type { Order } from '@/lib/types';

const mockOrders: Order[] = [
  {
    id: 'FD001234',
    customerId: 'U001',
    customerName: 'Jack Frost',
    customerPhone: '0901123456',
    restaurantId: 'R001',
    restaurantName: 'Pizza House',
    totalAmount: 576500,
    status: 'new',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:31:00Z',
    deliveryAddress: '123 Đường Lê Lợi, Quận 1, TP.HCM',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    deliveryFee: 20000,
    serviceFee: 5000,
    items: [
      { id: 'I001', name: 'Pizza Hải Sản', price: 250000, quantity: 1 },
      { id: 'I002', name: 'Coca-Cola', price: 15000, quantity: 2 },
    ],
    notes: 'Giao nhanh giúp mình',
  },
  {
    id: 'FD001235',
    customerId: 'U002',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0902233445',
    restaurantId: 'R002',
    restaurantName: 'Bún Bò Huế',
    totalAmount: 125000,
    status: 'processing',
    createdAt: '2024-01-15T10:15:00Z',
    updatedAt: '2024-01-15T10:20:00Z',
    deliveryAddress: '45 Nguyễn Huệ, Quận 1, TP.HCM',
    paymentMethod: 'wallet',
    paymentStatus: 'paid',
    deliveryFee: 15000,
    serviceFee: 3000,
    items: [
      { id: 'I003', name: 'Bún bò đặc biệt', price: 100000, quantity: 1 },
      { id: 'I004', name: 'Trà đá', price: 5000, quantity: 1 },
    ],
  },
  {
    id: 'FD001236',
    customerId: 'U003',
    customerName: 'Trần Thị B',
    customerPhone: '0911223344',
    restaurantId: 'R003',
    restaurantName: 'Phở Hà Nội',
    totalAmount: 85000,
    status: 'completed',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:40:00Z',
    deliveryAddress: '89 Pasteur, Quận 3, TP.HCM',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    deliveryFee: 10000,
    serviceFee: 2000,
    items: [
      { id: 'I005', name: 'Phở tái chín', price: 70000, quantity: 1 },
      { id: 'I006', name: 'Nước suối', price: 10000, quantity: 1 },
    ],
  },
  {
    id: 'FD001237',
    customerId: 'U004',
    customerName: 'Lê Văn C',
    customerPhone: '0988776655',
    restaurantId: 'R004',
    restaurantName: 'KFC',
    totalAmount: 299000,
    status: 'cancelled',
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-15T09:45:00Z',
    deliveryAddress: '12 Cách Mạng Tháng 8, Quận 10, TP.HCM',
    paymentMethod: 'cash',
    paymentStatus: 'refunded',
    deliveryFee: 20000,
    serviceFee: 5000,
    items: [
      { id: 'I007', name: 'Combo Gà Rán 5 Miếng', price: 279000, quantity: 1 },
    ],
    notes: 'Khách hủy vì chờ lâu',
  },
  {
    id: 'FD001238',
    customerId: 'U005',
    customerName: 'Phạm Thị D',
    customerPhone: '0977665544',
    restaurantId: 'R005',
    restaurantName: 'Gà Rán Seoul',
    totalAmount: 450000,
    status: 'processing',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:10:00Z',
    deliveryAddress: '77 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    deliveryFee: 25000,
    serviceFee: 7000,
    items: [
      { id: 'I008', name: 'Gà Rán Seoul Combo 8 Miếng', price: 400000, quantity: 1 },
      { id: 'I009', name: 'Pepsi', price: 15000, quantity: 2 },
    ],
  },
];


export default function OrdersPage() {
  return (
    <AdminLayout title="Quản lý đơn hàng" subtitle="Theo dõi và xử lý các đơn hàng">
      {/* Filter Section */}
      <div className="bg-white rounded-xl card-shadow mb-6 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            
            {/* bảng chọn tính chất đơn hàng */}
            <select className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm">
              <option value="">Tất cả</option>
              <option value="new">Mới</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {/* bảng chọn thể loại nhà hàng (tên, loại thức ăn, ...) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhà hàng
            </label>

            <select className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm">
              <option value="">Tất cả nhà hàng</option>
              <option value="pizza-house">Pizza House</option>
              <option value="bun-bo-hue">Bún Bò Huế</option>
              <option value="pho-ha-noi">Phở Hà Nội</option>
            </select>
          </div>

          {/* lọc ngày */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>        
            <input type="date" className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm" />
          </div>

          {/* nút */}
          <div className="flex items-end">
            <button className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors text-sm">
              Lọc
            </button>
          </div>
        </div>
      </div>


      {/* bảng danh sách các orders */}
      <div className="bg-white rounded-xl card-shadow">
        {/* tiêu đề các mục */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Danh sách đơn hàng</h2>
              <p className="text-gray-600 mt-1">Tổng {mockOrders.length} đơn hàng</p>
            </div>
            <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">
              Xuất Excel
            </button>
          </div>
        </div>

        {/* nội dung chính */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* tiêu đề/thể loại */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhà hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>

            {/* nội dung */}
            <tbody className="bg-white divide-y divide-gray-200">
              {mockOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.restaurantName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </td>

                  {/* Tạm hủy do StatusBadge bị lỗi */}
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.status}>
                      {order.status === 'new' && 'Mới'}
                      {order.status === 'processing' && 'Đang xử lý'}
                      {order.status === 'completed' && 'Hoàn thành'}
                      {order.status === 'cancelled' && 'Đã hủy'}
                    </StatusBadge>
                  </td> */}
                  
                  {/* thời điểm đặt hàng */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getRelativeTime(order.createdAt)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                      Chi tiết
                    </button>
                    {order.status === 'new' && (
                      <button className="text-green-600 hover:text-green-900 px-3 py-1 bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                        Xác nhận
                      </button>
                    )}
                    {(order.status === 'new' || order.status === 'processing') && (
                      <button className="text-red-600 hover:text-red-900 px-3 py-1 bg-red-50 hover:bg-red-100 rounded-md transition-colors">
                        Hủy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">5</span> của{' '}
              <span className="font-medium">{mockOrders.length}</span> kết quả
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 transition-colors">
                Trước
              </button>
              <button className="px-3 py-1 bg-primary-500 text-white rounded-md text-sm">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 transition-colors">
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}