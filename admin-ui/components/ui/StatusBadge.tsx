import { cn } from '@/lib/utils';
import React from 'react';

interface StatusBadgeProps {
  status: string;
  children: React.ReactNode;
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'yellow' | 'gray';
}

//set up bảng màu sử dụng: 
const statusStyles: Record<string, string> = {
  // bảng màu trạng thái order: 
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  preparing: 'bg-orange-50 text-orange-700 border-orange-200',
  delivering: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',

  // trạng thái thanh toán đơn hàng
  paid: 'bg-green-50 text-green-700 border-green-200',
  refunded: 'bg-gray-50 text-gray-700 border-gray-200',

  // trạng thái nhà hàng (đang bán/ chưa bán (nghỉ, dừng, ...))
  active: 'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-gray-50 text-gray-700 border-gray-200',

  // trạng thái người dùng (banned = chim cút).
  banned: 'bg-red-50 text-red-700 border-red-200',
};

const colorStyles = {
  green: 'bg-green-50 text-green-700 border-green-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  gray: 'bg-gray-50 text-gray-700 border-gray-200',
} as const;

export default function StatusBadge({ status, children, color }: StatusBadgeProps) {
  const getStatusStyle = () => {
    if (color) {
      return colorStyles[color];
    }
    
    return statusStyles[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
        getStatusStyle()
      )}
    >
      {children}
    </span>
  );
}
