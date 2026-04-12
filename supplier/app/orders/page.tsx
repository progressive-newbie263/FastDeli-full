'use client';

import React, { useCallback, useEffect, useState } from 'react';
import SupplierLayout from '../components/SupplierLayout';
import { useSupplierAuth } from '../contexts/SupplierAuthContext';
import SupplierAPI from '../lib/api';
import type { Order } from '../types';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Truck, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function OrdersPage() {
  const { restaurant, isLoading: authLoading } = useSupplierAuth();
  const ORDERS_PER_PAGE = 5;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedOrder]);

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
        setCurrentPage(1);
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

  const getSafeMoney = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getDiscountAmount = (order: Order) => {
    return Math.max(getSafeMoney(order.discount_amount), 0);
  };

  const getOriginalTotal = (order: Order) => {
    const original = getSafeMoney(order.original_total);
    const finalTotal = getSafeMoney(order.total_amount);
    if (original > 0) return original;
    return finalTotal + getDiscountAmount(order);
  };

  const getItemSubtotal = useCallback((item: Order['items'][number]) => {
    const subtotal = Number(item?.subtotal);
    if (Number.isFinite(subtotal)) {
      return subtotal;
    }

    const price = Number(item?.food_price) || 0;
    const quantity = Number(item?.quantity) || 0;
    return price * quantity;
  }, []);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800' },
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  const totalPages = Math.max(Math.ceil(filteredOrders.length / ORDERS_PER_PAGE), 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ORDERS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);
  const emptySlots = Math.max(ORDERS_PER_PAGE - paginatedOrders.length, 0);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    Math.max(0, safeCurrentPage - 3),
    Math.max(0, safeCurrentPage - 3) + 5
  );

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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 
                rounded-lg focus:border-transparent text-black
              "
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
               focus:border-transparent appearance-none text-black
              "
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              {/* <option value="processing">Đang chuẩn bị</option> */}
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
          <div className="divide-y divide-gray-200 min-h-[760px]">
            {paginatedOrders.map((order) => (
              <div 
                key={order.order_id || order.order_code} 
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">#{order.order_code || 'N/A'}</h3>
                      {getStatusBadge(order.order_status)}
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Khách hàng:</strong> 
                      {order.customer_name || 'Tên KH'} • {order.customer_phone || 'SĐT'}
                    </p>
                    
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Địa chỉ:</strong> {order.delivery_address || 'Địa chỉ'}
                    </p>

                    <p className="text-xs text-gray-500">
                      {order.created_at ? formatDateTime(order.created_at) : 'N/A'}
                    </p>
                  </div>

                  <div className="text-right">
                    {getDiscountAmount(order) > 0 && (
                      <p className="text-xs text-gray-400 line-through mb-0.5">
                        {formatCurrency(getOriginalTotal(order))}
                      </p>
                    )}
                    <p className="text-xl font-bold text-gray-900 mb-2">
                      {formatCurrency(getSafeMoney(order.total_amount))}
                    </p>
                    {getDiscountAmount(order) > 0 && (
                      <p className="text-sm text-green-600 font-medium mb-2">
                        -{formatCurrency(getDiscountAmount(order))}
                        {order.coupon_code ? ` (${order.coupon_code})` : ''}
                      </p>
                    )}
                    
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
                <div className="flex gap-2 flex-wrap">
                  {order.order_status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(order.order_id ?? (order as any).id, 'processing')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={18} />
                      Xác nhận
                    </button>
                  )}
                  
                  {order.order_status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(order.order_id ?? (order as any).id, 'cancelled')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle size={18} />
                      Từ chối
                    </button>
                  )}

                  {order.order_status === 'processing' && (
                    <button
                      onClick={() => handleStatusChange(order.order_id ?? (order as any).id, 'delivering')}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Clock size={18} />
                      Bàn giao đơn hàng
                    </button>
                  )}
                </div>
              </div>
            ))}

            {Array.from({ length: emptySlots }).map((_, index) => (
              <div key={`empty-slot-${index}`} className="p-6 opacity-0 pointer-events-none select-none">
                <div className="h-[118px]">placeholder</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && filteredOrders.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-600">
            Hiển thị {startIndex + 1}-{Math.min(startIndex + ORDERS_PER_PAGE, filteredOrders.length)} / {filteredOrders.length} đơn
          </p>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-2 py-2 shadow-sm">
            <button
              type="button"
              onClick={() => handlePageChange(Math.max(safeCurrentPage - 1, 1))}
              disabled={safeCurrentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
              Trước
            </button>

            <div className="flex items-center gap-1 px-1">
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => handlePageChange(pageNumber)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    pageNumber === safeCurrentPage
                      ? 'bg-orange-600 text-white shadow'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <span className="text-xs text-gray-500 px-1 hidden sm:inline">
              {safeCurrentPage}/{totalPages}
            </span>

            <button
              type="button"
              onClick={() => handlePageChange(Math.min(safeCurrentPage + 1, totalPages))}
              disabled={safeCurrentPage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          formatCurrency={formatCurrency}
          getItemSubtotal={getItemSubtotal}
        />
      )}
    </SupplierLayout>
  );
}

function OrderDetailModal({
  order,
  onClose,
  formatCurrency,
  getItemSubtotal,
}: {
  order: Order;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  getItemSubtotal: (item: Order['items'][number]) => number;
}) {
  const [visible, setVisible] = useState(false);

  const getSafeMoney = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const discountAmount = Math.max(getSafeMoney(order.discount_amount), 0);
  const finalTotal = getSafeMoney(order.total_amount);
  const originalTotalRaw = getSafeMoney(order.original_total);
  const originalTotal = originalTotalRaw > 0 ? originalTotalRaw : finalTotal + discountAmount;
  const deliveryFee = getSafeMoney(order.delivery_fee);
  const itemsTotal = Math.max(originalTotal - deliveryFee, 0);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 220);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? 'backdrop-blur-sm bg-black/40' : 'backdrop-blur-none bg-black/0'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-all duration-220 ${
          visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
        style={{ transition: 'opacity 220ms ease, transform 220ms ease' }}
      >
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng #{order.order_code}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{order.created_at ? new Date(order.created_at).toLocaleString('vi-VN') : ''}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Thông tin khách hàng</h3>
            <div className="space-y-1.5 text-sm text-gray-600">
              <p>Tên: {order.customer_name}</p>
              <p>SĐT: {order.customer_phone}</p>
              <p>Địa chỉ: {order.delivery_address}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Món ăn</h3>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div
                  key={item.order_item_id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm"
                >
                  <span className="text-gray-700">
                    {item.quantity}x {item.food_name}
                  </span>
                  <span className="font-semibold text-gray-900">{formatCurrency(getItemSubtotal(item))}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Tạm tính món:</span>
              <span>{formatCurrency(itemsTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Phí giao hàng:</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-sm text-green-600 font-medium">
                <span>
                  Giảm giá{order.coupon_code ? ` (${order.coupon_code})` : ''}:
                </span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-2xl font-bold pt-1">
              <span className="text-gray-900">Tổng cộng:</span>
              <span className="text-orange-600">{formatCurrency(finalTotal)}</span>
            </div>
          </div>

          {order.notes && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Ghi chú</h3>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleClose}
            className="w-full px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
