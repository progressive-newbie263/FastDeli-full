'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'order' | 'payment' | 'restaurant' | 'food';
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, variant = 'order', size = 'md' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    if (variant === 'order') {
      const configs: Record<string, { label: string; className: string }> = {
        pending: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800' },
        confirmed: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800' },
        processing: { label: 'Đang chuẩn bị', className: 'bg-purple-100 text-purple-800' },
        delivering: { label: 'Đang giao', className: 'bg-indigo-100 text-indigo-800' },
        delivered: { label: 'Đã giao', className: 'bg-green-100 text-green-800' },
        cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800' },
      };
      return configs[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    }

    if (variant === 'payment') {
      const configs: Record<string, { label: string; className: string }> = {
        pending: { label: 'Chưa thanh toán', className: 'bg-yellow-100 text-yellow-800' },
        paid: { label: 'Đã thanh toán', className: 'bg-green-100 text-green-800' },
        failed: { label: 'Thất bại', className: 'bg-red-100 text-red-800' },
        refunded: { label: 'Đã hoàn', className: 'bg-gray-100 text-gray-800' },
      };
      return configs[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    }

    if (variant === 'restaurant') {
      const configs: Record<string, { label: string; className: string }> = {
        active: { label: 'Hoạt động', className: 'bg-green-100 text-green-800' },
        inactive: { label: 'Tạm dừng', className: 'bg-gray-100 text-gray-800' },
        pending: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
        rejected: { label: 'Bị từ chối', className: 'bg-red-100 text-red-800' },
      };
      return configs[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    }

    if (variant === 'food') {
      const configs: Record<string, { label: string; className: string }> = {
        available: { label: 'Đang bán', className: 'bg-green-100 text-green-800' },
        unavailable: { label: 'Ngừng bán', className: 'bg-red-100 text-red-800' },
      };
      return configs[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    }

    return { label: status, className: 'bg-gray-100 text-gray-800' };
  };

  const getSizeClass = () => {
    if (size === 'sm') return 'px-2 py-0.5 text-xs';
    if (size === 'lg') return 'px-4 py-2 text-sm';
    return 'px-3 py-1 text-xs';
  };

  const config = getStatusConfig();

  return (
    <span className={`${config.className} ${getSizeClass()} rounded-full font-medium inline-block`}>
      {config.label}
    </span>
  );
}
