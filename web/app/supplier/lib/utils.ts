/**
 * ============================================
 * SUPPLIER UTILITIES
 * ============================================
 * Helper functions cho supplier portal
 */

/**
 * Format currency to Vietnamese Dong
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format date time to Vietnamese locale
 */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date only
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * Format time only
 */
export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get relative time (e.g., "2 giờ trước", "5 phút trước")
 */
export const getRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDate(dateString);
};

/**
 * Order status configuration
 */
export const ORDER_STATUS_CONFIG: Record<
  string,
  { label: string; className: string; color: string }
> = {
  pending: {
    label: 'Chờ xác nhận',
    className: 'bg-yellow-100 text-yellow-800',
    color: 'yellow',
  },
  confirmed: {
    label: 'Đã xác nhận',
    className: 'bg-blue-100 text-blue-800',
    color: 'blue',
  },
  processing: {
    label: 'Đang chuẩn bị',
    className: 'bg-purple-100 text-purple-800',
    color: 'purple',
  },
  delivering: {
    label: 'Đang giao',
    className: 'bg-indigo-100 text-indigo-800',
    color: 'indigo',
  },
  delivered: {
    label: 'Đã giao',
    className: 'bg-green-100 text-green-800',
    color: 'green',
  },
  cancelled: {
    label: 'Đã hủy',
    className: 'bg-red-100 text-red-800',
    color: 'red',
  },
};

/**
 * Payment status configuration
 */
export const PAYMENT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Chưa thanh toán', className: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Đã thanh toán', className: 'bg-green-100 text-green-800' },
  failed: { label: 'Thanh toán thất bại', className: 'bg-red-100 text-red-800' },
  refunded: { label: 'Đã hoàn tiền', className: 'bg-gray-100 text-gray-800' },
};

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Vietnamese format)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate price
 */
export const isValidPrice = (price: number): boolean => {
  return price > 0 && price < 100000000; // Max 100 million VND
};

/**
 * Truncate text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Calculate percentage change
 */
export const calculatePercentChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

/**
 * Format percentage
 */
export const formatPercent = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value}%`;
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Download data as JSON file
 */
export const downloadJSON = (data: any, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

/**
 * Generate random order code (fallback)
 */
export const generateOrderCode = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `ORD-${timestamp}-${random}`.toUpperCase();
};

/**
 * Check if restaurant is open
 */
export const isRestaurantOpen = (openingTime?: string, closingTime?: string): boolean => {
  if (!openingTime || !closingTime) return true; // Assume open if not set

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [openHour, openMin] = openingTime.split(':').map(Number);
  const [closeHour, closeMin] = closingTime.split(':').map(Number);

  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  return currentTime >= openMinutes && currentTime <= closeMinutes;
};

/**
 * Get status color class
 */
export const getStatusColorClass = (status: string): string => {
  const colorMap: Record<string, string> = {
    active: 'text-green-600',
    inactive: 'text-gray-600',
    pending: 'text-yellow-600',
    rejected: 'text-red-600',
  };
  return colorMap[status] || 'text-gray-600';
};
