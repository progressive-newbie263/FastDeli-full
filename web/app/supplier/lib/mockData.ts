/**
 * ============================================
 * MOCK DATA FOR SUPPLIER PORTAL
 * ============================================
 * Hardcoded data for testing UI without backend
 */

import type { SupplierStats, Order, Food, Restaurant } from '../types';

// Mock Restaurant Data
export const MOCK_RESTAURANT: Restaurant = {
  id: 1,
  name: 'Nhà hàng Phở Việt Nam',
  address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
  phone: '0901234567',
  email: 'phovietnam@gmail.com',
  description: 'Chuyên phục vụ các món phở truyền thống Việt Nam với hương vị đậm đà, nguyên liệu tươi ngon',
  image_url: 'https://res.cloudinary.com/dpldznnma/image/upload/v1751874870/main.jpg',
  rating: 4.5,
  total_reviews: 248,
  status: 'active',
  delivery_time: '30-45 phút',
  delivery_fee: 15000,
  min_order_value: 50000,
  opening_time: '07:00',
  closing_time: '22:00',
  created_at: '2024-01-15T08:00:00Z',
  latitude: 10.762622,
  longitude: 106.660172,
};

// Mock Statistics
export const MOCK_STATS: SupplierStats = {
  totalOrders: 1247,
  totalRevenue: 85420000,
  totalFoods: 42,
  avgRating: 4.5,
  pendingOrders: 8,
  todayOrders: 23,
  todayRevenue: 3240000,
  ordersTrend: 12.5,
  revenueTrend: 8.3,
};

// Mock Orders
export const MOCK_ORDERS: Order[] = [
  {
    order_id: 1,
    order_code: 'ORD-20260108-001',
    customer_name: 'Nguyễn Văn A',
    customer_phone: '0912345678',
    delivery_address: '456 Lê Lợi, Quận 1, TP.HCM',
    total_amount: 235000,
    order_status: 'pending',
    payment_status: 'paid',
    payment_method: 'momo',
    created_at: '2026-01-08T09:30:00Z',
    items: [
      {
        order_item_id: 1,
        food_id: 1,
        food_name: 'Phở Bò Tái',
        food_price: 65000,
        quantity: 2,
        subtotal: 130000,
      },
      {
        order_item_id: 2,
        food_id: 3,
        food_name: 'Gỏi Cuốn (4 cuốn)',
        food_price: 35000,
        quantity: 3,
        subtotal: 105000,
      },
    ],
    notes: 'Không hành, ít ớt',
  },
  {
    order_id: 2,
    order_code: 'ORD-20260108-002',
    customer_name: 'Trần Thị B',
    customer_phone: '0987654321',
    delivery_address: '789 Hai Bà Trưng, Quận 3, TP.HCM',
    total_amount: 180000,
    order_status: 'confirmed',
    payment_status: 'paid',
    payment_method: 'zalopay',
    created_at: '2026-01-08T08:15:00Z',
    items: [
      {
        order_item_id: 3,
        food_id: 2,
        food_name: 'Phở Gà',
        food_price: 60000,
        quantity: 1,
        subtotal: 60000,
      },
      {
        order_item_id: 4,
        food_id: 5,
        food_name: 'Bún Bò Huế',
        food_price: 70000,
        quantity: 1,
        subtotal: 70000,
      },
      {
        order_item_id: 5,
        food_id: 4,
        food_name: 'Chả Giò (5 cuốn)',
        food_price: 50000,
        quantity: 1,
        subtotal: 50000,
      },
    ],
  },
  {
    order_id: 3,
    order_code: 'ORD-20260108-003',
    customer_name: 'Lê Văn C',
    customer_phone: '0909999888',
    delivery_address: '321 Võ Văn Tần, Quận 3, TP.HCM',
    total_amount: 95000,
    order_status: 'processing',
    payment_status: 'paid',
    payment_method: 'cod',
    created_at: '2026-01-08T07:45:00Z',
    items: [
      {
        order_item_id: 6,
        food_id: 1,
        food_name: 'Phở Bò Tái',
        food_price: 65000,
        quantity: 1,
        subtotal: 65000,
      },
      {
        order_item_id: 7,
        food_id: 6,
        food_name: 'Trà Đá',
        food_price: 10000,
        quantity: 3,
        subtotal: 30000,
      },
    ],
  },
  {
    order_id: 4,
    order_code: 'ORD-20260107-098',
    customer_name: 'Phạm Thị D',
    customer_phone: '0911222333',
    delivery_address: '555 Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
    total_amount: 340000,
    order_status: 'delivering',
    payment_status: 'paid',
    payment_method: 'momo',
    created_at: '2026-01-07T19:20:00Z',
    items: [
      {
        order_item_id: 8,
        food_id: 2,
        food_name: 'Phở Gà',
        food_price: 60000,
        quantity: 2,
        subtotal: 120000,
      },
      {
        order_item_id: 9,
        food_id: 5,
        food_name: 'Bún Bò Huế',
        food_price: 70000,
        quantity: 2,
        subtotal: 140000,
      },
      {
        order_item_id: 10,
        food_id: 7,
        food_name: 'Cơm Tấm Sườn Bì Chả',
        food_price: 55000,
        quantity: 1,
        subtotal: 55000,
      },
      {
        order_item_id: 11,
        food_id: 8,
        food_name: 'Nước Ngọt',
        food_price: 15000,
        quantity: 1,
        subtotal: 15000,
      },
    ],
  },
  {
    order_id: 5,
    order_code: 'ORD-20260107-097',
    customer_name: 'Hoàng Văn E',
    customer_phone: '0933444555',
    delivery_address: '777 Cách Mạng Tháng 8, Quận 10, TP.HCM',
    total_amount: 155000,
    order_status: 'delivered',
    payment_status: 'paid',
    payment_method: 'zalopay',
    created_at: '2026-01-07T12:30:00Z',
    items: [
      {
        order_item_id: 12,
        food_id: 1,
        food_name: 'Phở Bò Tái',
        food_price: 65000,
        quantity: 2,
        subtotal: 130000,
      },
      {
        order_item_id: 13,
        food_id: 8,
        food_name: 'Nước Ngọt',
        food_price: 15000,
        quantity: 1,
        subtotal: 15000,
      },
    ],
  },
];

// Mock Foods/Menu
export const MOCK_FOODS: Food[] = [
  {
    food_id: 1,
    food_name: 'Phở Bò Tái',
    description: 'Phở bò với thịt bò tái mềm, nước dùng trong, thơm ngon',
    price: 65000,
    image_url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    category_id: 1,
    category_name: 'Món Phở',
    is_available: true,
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    food_id: 2,
    food_name: 'Phở Gà',
    description: 'Phở gà nước trong, thịt gà thơm ngon, đậm đà hương vị truyền thống',
    price: 60000,
    image_url: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400',
    category_id: 1,
    category_name: 'Món Phở',
    is_available: true,
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    food_id: 3,
    food_name: 'Gỏi Cuốn (4 cuốn)',
    description: 'Gỏi cuốn tươi với tôm, thit, rau sống và bún. Ăn kèm nước chấm đặc biệt',
    price: 35000,
    image_url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400',
    category_id: 2,
    category_name: 'Món Khai Vị',
    is_available: true,
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    food_id: 4,
    food_name: 'Chả Giò (5 cuốn)',
    description: 'Chả giò chiên giòn, nhân đậm đà, ăn kèm rau sống',
    price: 50000,
    image_url: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400',
    category_id: 2,
    category_name: 'Món Khai Vị',
    is_available: true,
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    food_id: 5,
    food_name: 'Bún Bò Huế',
    description: 'Bún bò Huế chuẩn vị, cay nồng, thơm ngon',
    price: 70000,
    image_url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    category_id: 3,
    category_name: 'Món Bún',
    is_available: true,
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    food_id: 6,
    food_name: 'Trà Đá',
    description: 'Trà đá mát lạnh',
    price: 10000,
    image_url: undefined,
    category_id: 4,
    category_name: 'Đồ Uống',
    is_available: true,
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    food_id: 7,
    food_name: 'Cơm Tấm Sườn Bì Chả',
    description: 'Cơm tấm với sườn nướng, bì, chả, ăn kèm dưa leo, cà chua',
    price: 55000,
    image_url: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400',
    category_id: 5,
    category_name: 'Cơm',
    is_available: true,
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    food_id: 8,
    food_name: 'Nước Ngọt',
    description: 'Coca, Pepsi, 7Up các loại',
    price: 15000,
    image_url: undefined,
    category_id: 4,
    category_name: 'Đồ Uống',
    is_available: true,
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    food_id: 9,
    food_name: 'Phở Đặc Biệt',
    description: 'Phở với đầy đủ các loại thịt bò: tái, nạm, gầu, gân, sách',
    price: 75000,
    image_url: 'https://images.unsplash.com/photo-1547928575-8b0c85e0a6df?w=400',
    category_id: 1,
    category_name: 'Món Phở',
    is_available: true,
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    food_id: 10,
    food_name: 'Bánh Mì Thịt Nguội',
    description: 'Bánh mì thịt nguội với pate, dưa leo, rau thơm',
    price: 25000,
    image_url: 'https://images.unsplash.com/photo-1598511726623-d2e9996892f0?w=400',
    category_id: 6,
    category_name: 'Món Ăn Nhanh',
    is_available: false,
    created_at: '2024-01-15T08:00:00Z',
  },
];

// Mock Categories
export const MOCK_CATEGORIES = [
  { category_id: 1, category_name: 'Món Phở', description: 'Các món phở truyền thống' },
  { category_id: 2, category_name: 'Món Khai Vị', description: 'Các món khai vị' },
  { category_id: 3, category_name: 'Món Bún', description: 'Các món bún' },
  { category_id: 4, category_name: 'Đồ Uống', description: 'Nước uống các loại' },
  { category_id: 5, category_name: 'Cơm', description: 'Các món cơm' },
  { category_id: 6, category_name: 'Món Ăn Nhanh', description: 'Bánh mì, xôi...' },
];

// Helper function to filter orders by status
export const filterOrdersByStatus = (status: string): Order[] => {
  if (status === 'all') return MOCK_ORDERS;
  return MOCK_ORDERS.filter(order => order.order_status === status);
};

// Helper function to search orders
export const searchOrders = (query: string): Order[] => {
  const lowerQuery = query.toLowerCase();
  return MOCK_ORDERS.filter(order => 
    order.order_code.toLowerCase().includes(lowerQuery) ||
    order.customer_name.toLowerCase().includes(lowerQuery) ||
    order.customer_phone.includes(lowerQuery)
  );
};

// Helper function to get order by ID
export const getOrderById = (id: number): Order | undefined => {
  return MOCK_ORDERS.find(order => order.order_id === id);
};

// Helper function to filter foods
export const searchFoods = (query: string): Food[] => {
  const lowerQuery = query.toLowerCase();
  return MOCK_FOODS.filter(food => 
    food.food_name.toLowerCase().includes(lowerQuery) ||
    food.description.toLowerCase().includes(lowerQuery)
  );
};
