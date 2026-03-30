'use client';

import { useState, useEffect } from 'react';
import { Eye, MapPin, Phone, ReceiptText, UserRound, X } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import ApiService from '@/lib/api';
import { formatCurrency, getRelativeTime } from '@/lib/utils';
import type { Order } from '@/app/types/admin';

// Define valid order status type
type OrderStatus = 'pending' | 'processing' | 'delivering' | 'delivered' | 'cancelled';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  useEffect(() => {
    const total = orders.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    setTotalItems(total);
    setTotalPages(pages);

    if (currentPage > pages) {
      setCurrentPage(1);
    }
  }, [orders, perPage, currentPage]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const filters: Record<string, string> | undefined = 
        filter !== 'all' ? { order_status: filter } : undefined;
      
      const response = await ApiService.getOrders(filters);
      if (response.success) {
        const list: Order[] = Array.isArray(response.data) ? response.data : [];
        setOrders(list);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    const clamped = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(clamped);
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setCurrentPage(1);
  };

  const handleStatusChange = async (id: string | number, newStatus: OrderStatus) => {
    if (!id) {
      console.error('Order ID is missing');
      return;
    }

    try {
      setUpdatingOrderId(id);
      const response = await ApiService.updateOrderStatus(String(id), newStatus);
      
      if (response.success) {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === id ? { ...order, order_status: newStatus } : order
          )
        );
      } else {
        alert(`Không thể cập nhật: ${response.message || 'Lỗi không xác định'}`);
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
      fetchOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
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
      case 'processing': return 'Đang chuẩn bị';
      case 'delivering': return 'Đang giao';
      case 'delivered': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';

      default: return status;
    }
  };

  const pagedOrders = orders.slice((currentPage - 1) * perPage, currentPage * perPage);

  const statusFilters: Array<{ value: OrderStatus | 'all'; label: string }> = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'processing', label: 'Đang chuẩn bị' },
    { value: 'delivering', label: 'Đang giao' },
    { value: 'delivered', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
  ];

  return (
    <AdminLayout 
      title="Quản lý đơn hàng" 
      subtitle="Theo dõi và xử lý các đơn hàng"
    >
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((statusFilter) => (
            <button
              key={statusFilter.value}
              onClick={() => {
                setFilter(statusFilter.value);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === statusFilter.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/15 border border-gray-200 dark:border-white/10'
              }`}
            >
              {statusFilter.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">Hiển thị:</span>
          <select
            value={perPage}
            onChange={(e) => handlePerPageChange(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm 
              focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
            "
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl card-shadow overflow-hidden border border-transparent dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trạng thái đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trạng thái thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nội dung
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Đang tải...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                pagedOrders.map((order) => {
                  const isUpdating = updatingOrderId === order.id;
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          #{order.order_code}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{order.user_name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{order.user_phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {getRelativeTime(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {order.order_status === 'pending' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'processing')}
                              disabled={isUpdating}
                              className={`text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 ${
                                isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {isUpdating ? 'Đang xử lý...' : 'Xác nhận'}
                            </button>
                          )}
                          {order.order_status === 'processing' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'delivering')}
                              disabled={isUpdating}
                              className={`text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 ${
                                isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {isUpdating ? 'Đang xử lý...' : 'Giao hàng'}
                            </button>
                          )}
                          <button 
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-gray-700 hover:text-primary-700 hover:bg-primary-50 
                              dark:text-gray-200 dark:hover:text-primary-300 dark:hover:bg-primary-500/10 transition-colors
                            "
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                            Xem
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 
          rounded-xl card-shadow p-4 border border-transparent dark:border-gray-700
        ">
          <div className="text-sm text-gray-700 dark:text-gray-200">
            Hiển thị <span className="font-medium">{(currentPage - 1) * perPage + 1}</span> đến{' '}
            <span className="font-medium">
              {Math.min(currentPage * perPage, totalItems)}
            </span>{' '}
            trong tổng số <span className="font-medium">{totalItems}</span> đơn hàng
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 1
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-300 dark:border-gray-600'
              }`}
            >
              Trước
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-primary-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="px-2 py-1.5 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-300 dark:border-gray-600'
              }`}
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </AdminLayout>
  );
}

function OrderDetailModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  const closeWithAnimation = () => {
    setVisible(false);
    window.setTimeout(onClose, 220);
  };

  const deliveryFee = Number.isFinite(Number(order.delivery_fee)) ? Number(order.delivery_fee) : 0;
  const total = Number.isFinite(Number(order.total_amount)) ? Number(order.total_amount) : 0;
  const itemsSubtotal = Math.max(total - deliveryFee, 0);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? 'bg-slate-900/45 backdrop-blur-md' : 'bg-slate-900/0 backdrop-blur-none'
      }`}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeWithAnimation();
        }
      }}
    >
      <div
        className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/35 bg-white/90 dark:bg-slate-900/85 dark:border-white/10 shadow-[0_24px_80px_rgba(15,23,42,0.32)] transition-all duration-200 ${
          visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-[0.98]'
        }`}
      >
        <div className="sticky top-0 z-10 border-b border-slate-200/70 dark:border-slate-700/60 bg-gradient-to-r from-cyan-50/95 via-white/95 to-blue-50/95 dark:from-slate-900/95 dark:via-slate-900/95 dark:to-slate-900/95 backdrop-blur-sm px-6 py-4 rounded-t-3xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300 font-semibold">
              Thông tin đơn hàng
            </p>
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              #{order.order_code}
            </h2>
            
            <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
              {new Date(order.created_at).toLocaleString('vi-VN')}
            </p>
          </div>

          <button
            type="button"
            onClick={closeWithAnimation}
            className="w-9 h-9 rounded-full border border-slate-300/80 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Khách hàng</p>

              <div className="space-y-2.5 text-sm text-slate-700 dark:text-slate-200">
                <p className="flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-cyan-600" /> {order.user_name || 'Khách lẻ'}
                </p>

                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-cyan-600" />
                  {order.user_phone || 'Chưa cập nhật'}
                </p>
                
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-cyan-600 mt-0.5" /> 
                  <span>{order.delivery_address || 'Không có địa chỉ'}</span>
                </p>
              </div>
            </div>

            {/* card pop up thanh toán */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Thanh toán</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(itemsSubtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Phí giao hàng</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-slate-800 dark:text-slate-100 font-semibold">Tổng cộng:</span>
                  <span className="text-lg font-bold text-cyan-700 dark:text-cyan-300">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Món ăn</p>
              <ReceiptText className="w-4 h-4 text-cyan-600" />
            </div>

            {order.items && order.items.length > 0 ? (
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.order_item_id} className="flex items-center justify-between text-sm rounded-xl bg-slate-50 dark:bg-slate-900/70 
                    border border-slate-200 dark:border-slate-700 px-3 py-2.5
                  ">
                    <span className="text-slate-700 dark:text-slate-200">
                      {item.quantity}x {item.food_name}
                    </span>

                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(item.food_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Đơn hàng hiện tại chưa có thông tin chi tiết
              </p>
            )}
          </div>

          {order.notes && (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-500/40 bg-amber-50/80 dark:bg-amber-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300 mb-2">Ghi chú</p>
              <p className="text-sm text-amber-900 dark:text-amber-100">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200/70 dark:border-slate-700/60 p-5 bg-slate-50/80 dark:bg-slate-900/60 rounded-b-3xl">
          <button
            type="button"
            onClick={closeWithAnimation}
            className="w-full rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 py-2.5 
              font-semibold hover:opacity-90 transition-opacity
            "
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}