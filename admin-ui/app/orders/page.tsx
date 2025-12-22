// admin-ui/app/orders/page.tsx - Cập nhật
'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import ApiService from '@/lib/api';
import { formatCurrency, getRelativeTime } from '@/lib/utils';
import type { Order } from '@/app/types/admin';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const filters = filter !== 'all' ? { order_status: filter } : {};
      const response = await ApiService.getOrders(filters);
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await ApiService.updateOrderStatus(id, newStatus);
      if (response.success) {
        fetchOrders(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'confirmed': return 'blue';
      case 'processing': return 'blue';
      case 'delivering': return 'purple';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'processing': return 'Đang chuẩn bị';
      case 'delivering': return 'Đang giao';
      case 'delivered': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.order_status === filter);

  return (
    <AdminLayout 
      title="Quản lý đơn hàng" 
      subtitle="Theo dõi và xử lý các đơn hàng"
    >
      {/* Filters */}
      <div className="mb-6">
        <div className="flex gap-2">
          {['all', 'pending', 'confirmed', 'processing', 'delivering', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? 'Tất cả' : getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.order_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.user_name}</div>
                      <div className="text-sm text-gray-500">{order.user_phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge 
                        status={order.order_status}
                        color={getStatusColor(order.order_status)}
                      >
                        {getStatusText(order.order_status)}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge 
                        status={order.payment_status}
                        color={
                          order.payment_status === 'paid' ? 'green' : 
                          order.payment_status === 'refunded' ? 'gray' : 'yellow'
                        }
                      >
                        {
                          order.payment_status === 'pending' ? 'Chờ thanh toán' :
                          order.payment_status === 'paid' ? 'Đã thanh toán' : 'Đã hoàn tiền'
                        }
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getRelativeTime(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {order.order_status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'confirmed')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Xác nhận
                          </button>
                        )}
                        {order.order_status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'processing')}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            Chuẩn bị
                          </button>
                        )}
                        {order.order_status === 'processing' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'delivering')}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Giao hàng
                          </button>
                        )}
                        <button className="text-gray-600 hover:text-gray-900">
                          Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}