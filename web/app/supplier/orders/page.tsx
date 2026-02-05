'use client';

import React, { useEffect, useState } from 'react';
import SupplierLayout from '../components/SupplierLayout';
import { useSupplierAuth } from '../contexts/SupplierAuthContext';
import SupplierAPI from '../lib/api';
import type { Order } from '../types';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Truck } from 'lucide-react';

export default function OrdersPage() {
  const { restaurant, isLoading: authLoading } = useSupplierAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Chờ auth loading xong trước
    if (authLoading) {
      return;
    }

    if (restaurant?.id) {
      loadOrders();
    } else {
      // Restaurant chưa load hoặc không tồn tại
      setLoading(false);
    }
  }, [restaurant, selectedStatus, authLoading]);

  const loadOrders = async () => {
    if (!restaurant?.id) return;

    try {
      setLoading(true);
      const response = await SupplierAPI.getMyOrders(
        restaurant.id,
        1,
        50,
        selectedStatus === 'all' ? undefined : selectedStatus
      );

      if (response.success && response.data) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const response = await SupplierAPI.updateOrderStatus(orderId, newStatus);

      if (response.success) {
        // Update local state immediately for better UX
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.order_id === orderId ? { ...order, order_status: newStatus as any } : order
          )
        );
        // Also update selected order if it's the same
        if (selectedOrder && selectedOrder.order_id === orderId) {
          setSelectedOrder({ ...selectedOrder, order_status: newStatus as any });
        }
        alert('Cập nhật trạng thái đơn hàng thành công');
      } else {
        alert(response.message || 'Không thể cập nhật trạng thái');
      }
    } catch (error) {
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800' },
      processing: { label: 'Đang chuẩn bị', className: 'bg-purple-100 text-purple-800' },
      delivering: { label: 'Đang giao', className: 'bg-indigo-100 text-indigo-800' },
      delivered: { label: 'Đã giao', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800' },
    };

    const item = config[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.className}`}>{item.label}</span>;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery);
    return matchesSearch;
  });

  return (
    <SupplierLayout title="Quản lý đơn hàng" subtitle="Xem và xử lý đơn hàng từ khách hàng">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc đơn hàng</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm mã đơn, tên khách hàng, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="processing">Đang chuẩn bị</option>
              <option value="delivering">Đang giao</option>
              <option value="delivered">Đã giao</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders list */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Clock className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-lg">Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <div key={order.order_id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">#{order.order_code}</h3>
                      {getStatusBadge(order.order_status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Khách hàng:</strong> {order.customer_name} • {order.customer_phone}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Địa chỉ:</strong> {order.delivery_address}
                    </p>
                    <p className="text-xs text-gray-500">{formatDateTime(order.created_at)}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 mb-2">{formatCurrency(order.total_amount)}</p>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Eye size={16} />
                      Chi tiết
                    </button>
                  </div>
                </div>

                {/* Order items */}
                <div className="mb-4 pl-4 border-l-2 border-gray-200">
                  {order.items?.map((item) => (
                    <p key={item.order_item_id} className="text-sm text-gray-700 mb-1">
                      {item.quantity}x {item.food_name} - {formatCurrency(item.food_price)}
                    </p>
                  ))}
                </div>

                {/* Quick actions */}
                {order.order_status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(order.order_id, 'confirmed')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={18} />
                      Xác nhận
                    </button>
                    <button
                      onClick={() => handleStatusChange(order.order_id, 'cancelled')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle size={18} />
                      Từ chối
                    </button>
                  </div>
                )}

                {order.order_status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusChange(order.order_id, 'processing')}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Clock size={18} />
                    Bắt đầu chuẩn bị
                  </button>
                )}

                {order.order_status === 'processing' && (
                  <button
                    onClick={() => handleStatusChange(order.order_id, 'delivering')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Truck size={18} />
                    Bàn giao shipper
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng #{selectedOrder.order_code}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Thông tin khách hàng</h3>
                  <p className="text-sm text-gray-600">Tên: {selectedOrder.customer_name}</p>
                  <p className="text-sm text-gray-600">SĐT: {selectedOrder.customer_phone}</p>
                  <p className="text-sm text-gray-600">Địa chỉ: {selectedOrder.delivery_address}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Món ăn</h3>
                  {selectedOrder.items?.map((item) => (
                    <div key={item.order_item_id} className="flex justify-between text-sm mb-2">
                      <span>
                        {item.quantity}x {item.food_name}
                      </span>
                      <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-orange-600">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Ghi chú</h3>
                    <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </SupplierLayout>
  );
}
