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
  pending: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
  confirmed: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
  processing: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700',
  delivering: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
  delivered: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
  cancelled: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',

  // trạng thái thanh toán đơn hàng
  paid: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
  // Match UI: dark pill with light text
  refunded: 'bg-gray-800 text-white border-gray-800 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600',

  // trạng thái nhà hàng (đang bán/ chưa bán (nghỉ, dừng, ...))
  active: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
  inactive: 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',

  // trạng thái người dùng (banned = chim cút).
  banned: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
};

const colorStyles = {
  green: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
  // Slightly stronger blue to resemble the screenshot pills
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
  orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700',
  red: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
  gray: 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
} as const;

export default function StatusBadge({ status, children, color }: StatusBadgeProps) {
  const getStatusStyle = () => {
    if (color) {
      return colorStyles[color];
    }
    
    return statusStyles[status] || 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
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
