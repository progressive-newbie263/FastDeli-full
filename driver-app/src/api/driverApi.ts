import { httpGet, httpPost, driverUrl } from './http';
import type {
  ApiResponse,
  DeliveredOrderHistoryDTO,
  DeliveringOrderDTO,
  DriverProfileDTO,
  OrderMapDTO,
} from '../domain/driverDto';
import { DEV_MOCK_MODE, MOCK_DRIVER_ACCOUNT } from '../config/api';

const mockMapByOrderId: Record<number, OrderMapDTO> = {
  50001: {
    order_id: 50001,
    order_code: 'FD-50001',
    order_status: 'delivering',
    restaurant: {
      restaurant_id: 101,
      name: 'Com Tam Sai Gon',
      latitude: 10.7768,
      longitude: 106.7002,
    },
    customer: {
      user_id: 2001,
      full_name: 'Nguyen Van A',
      latitude: 10.7792,
      longitude: 106.7044,
      delivery_address: '15 Ton Duc Thang, Quan 1',
      phone_number: '0908111222',
      note: 'Giao dưới sảnh, gọi trước 2 phút',
    },
    virtual_candidates: [
      { candidate_idx: 0, latitude: 10.7759, longitude: 106.6999 },
      { candidate_idx: 1, latitude: 10.7762, longitude: 106.7013 },
      { candidate_idx: 2, latitude: 10.7771, longitude: 106.7021 },
    ],
    selected_virtual_candidate_idx: 1,
    assigned_driver: {
      user_id: MOCK_DRIVER_ACCOUNT.user.user_id,
      full_name: MOCK_DRIVER_ACCOUNT.user.full_name,
      phone_number: MOCK_DRIVER_ACCOUNT.user.phone_number,
      avatar_url: undefined,
    },
  },
  50002: {
    order_id: 50002,
    order_code: 'FD-50002',
    order_status: 'delivering',
    restaurant: {
      restaurant_id: 102,
      name: 'Pho Bac Ha Noi',
      latitude: 10.7705,
      longitude: 106.6937,
    },
    customer: {
      user_id: 2002,
      full_name: 'Tran Thi B',
      latitude: 10.7689,
      longitude: 106.6899,
      delivery_address: '22 Pasteur, Quan 3',
      phone_number: '0909333444',
      note: 'Nhớ xin mã OTP giao hàng',
    },
    virtual_candidates: [
      { candidate_idx: 0, latitude: 10.7711, longitude: 106.6942 },
      { candidate_idx: 1, latitude: 10.7708, longitude: 106.6931 },
    ],
    selected_virtual_candidate_idx: 0,
    assigned_driver: {
      user_id: MOCK_DRIVER_ACCOUNT.user.user_id,
      full_name: MOCK_DRIVER_ACCOUNT.user.full_name,
      phone_number: MOCK_DRIVER_ACCOUNT.user.phone_number,
      avatar_url: undefined,
    },
  },
};

let mockDeliveringOrders: DeliveringOrderDTO[] = Object.values(mockMapByOrderId).map((item) => ({
  order_id: item.order_id,
  order_code: item.order_code,
  order_status: item.order_status,
  restaurant: item.restaurant,
  customer: {
    user_id: item.customer.user_id,
    full_name: item.customer.full_name,
    delivery_address: item.customer.delivery_address,
    phone_number: item.customer.phone_number,
  },
  selected_virtual_candidate: item.virtual_candidates.find(
    (c) => c.candidate_idx === item.selected_virtual_candidate_idx
  ),
}));

let mockDeliveredHistory: DeliveredOrderHistoryDTO[] = [
  {
    order_id: 49998,
    order_code: 'FD-49998',
    restaurant_name: 'Bun Bo Co Mai',
    customer_name: 'Le Van C',
    delivery_address: '38 Le Loi, Quan 1',
    delivered_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    payout_amount: 28000,
  },
  {
    order_id: 49997,
    order_code: 'FD-49997',
    restaurant_name: 'Ga Ran Crispy',
    customer_name: 'Pham Thi D',
    delivery_address: '90 Nguyen Dinh Chieu, Quan 3',
    delivered_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    payout_amount: 32000,
  },
];

let mockAutoOrderSeq = 50010;

export function injectMockIncomingOrder() {
  if (!DEV_MOCK_MODE) return null;

  const orderId = mockAutoOrderSeq++;
  const baseLat = 10.77 + Math.random() * 0.02;
  const baseLng = 106.69 + Math.random() * 0.02;

  const mapData: OrderMapDTO = {
    order_id: orderId,
    order_code: `FD-${orderId}`,
    order_status: 'delivering',
    restaurant: {
      restaurant_id: 200 + (orderId % 10),
      name: `Quan Mock ${orderId % 7}`,
      latitude: Number(baseLat.toFixed(6)),
      longitude: Number(baseLng.toFixed(6)),
    },
    customer: {
      user_id: 3000 + orderId,
      full_name: `Khach moi ${orderId}`,
      latitude: Number((baseLat + 0.002).toFixed(6)),
      longitude: Number((baseLng + 0.003).toFixed(6)),
      delivery_address: `${20 + (orderId % 80)} Duong Mock, Quan ${1 + (orderId % 6)}`,
      phone_number: `0909${String(orderId).slice(-6)}`,
      note: 'Đơn mới tự động từ mock mode',
    },
    virtual_candidates: [
      { candidate_idx: 0, latitude: Number((baseLat - 0.001).toFixed(6)), longitude: Number((baseLng - 0.001).toFixed(6)) },
      { candidate_idx: 1, latitude: Number((baseLat + 0.001).toFixed(6)), longitude: Number((baseLng + 0.001).toFixed(6)) },
    ],
    selected_virtual_candidate_idx: 1,
    assigned_driver: {
      user_id: MOCK_DRIVER_ACCOUNT.user.user_id,
      full_name: MOCK_DRIVER_ACCOUNT.user.full_name,
      phone_number: MOCK_DRIVER_ACCOUNT.user.phone_number,
      avatar_url: undefined,
    },
  };

  mockMapByOrderId[orderId] = mapData;
  const delivering: DeliveringOrderDTO = {
    order_id: mapData.order_id,
    order_code: mapData.order_code,
    order_status: 'delivering',
    restaurant: mapData.restaurant,
    customer: {
      user_id: mapData.customer.user_id,
      full_name: mapData.customer.full_name,
      delivery_address: mapData.customer.delivery_address,
      phone_number: mapData.customer.phone_number,
    },
    selected_virtual_candidate: mapData.virtual_candidates.find(
      (c) => c.candidate_idx === mapData.selected_virtual_candidate_idx
    ),
  };

  mockDeliveringOrders = [delivering, ...mockDeliveringOrders];
  return delivering;
}

export async function registerDriver(payload: {
  phone_number: string;
  email: string;
  password: string;
  full_name: string;
  gender?: string;
  date_of_birth?: string;
}): Promise<ApiResponse<{ user_id: number }>> {
  if (DEV_MOCK_MODE) {
    return {
      success: true,
      message: 'Mock register success',
      data: { user_id: MOCK_DRIVER_ACCOUNT.user.user_id },
    };
  }
  return httpPost<ApiResponse<{ user_id: number }>>(driverUrl.register, payload);
}

export async function updateDriverLocation(payload: { latitude: number; longitude: number }) {
  if (DEV_MOCK_MODE) {
    return { success: true, message: 'Mock location updated', data: payload };
  }
  return httpPost(driverUrl.location, payload);
}

export async function getDeliveringOrders(): Promise<ApiResponse<DeliveringOrderDTO[]>> {
  if (DEV_MOCK_MODE) {
    return {
      success: true,
      data: mockDeliveringOrders,
      message: 'Mock delivering orders',
    };
  }
  return httpGet<ApiResponse<DeliveringOrderDTO[]>>(driverUrl.deliveringOrders);
}

export async function getDeliveredHistory(): Promise<ApiResponse<DeliveredOrderHistoryDTO[]>> {
  if (DEV_MOCK_MODE) {
    return {
      success: true,
      data: mockDeliveredHistory,
      message: 'Mock delivered history',
    };
  }

  return {
    success: true,
    data: [],
    message: 'History API not implemented yet',
  };
}

export async function getDriverProfile(): Promise<ApiResponse<DriverProfileDTO>> {
  if (DEV_MOCK_MODE) {
    return {
      success: true,
      data: {
        user_id: MOCK_DRIVER_ACCOUNT.user.user_id,
        full_name: MOCK_DRIVER_ACCOUNT.user.full_name,
        phone_number: MOCK_DRIVER_ACCOUNT.user.phone_number,
        email: MOCK_DRIVER_ACCOUNT.user.email,
        vehicle_type: 'Honda Vision',
        vehicle_plate: '59A3-123.45',
        rating: 4.86,
        completed_orders: mockDeliveredHistory.length,
        joined_at: '2025-11-03T08:00:00.000Z',
      },
      message: 'Mock driver profile',
    };
  }

  return {
    success: false,
    message: 'Profile API not implemented yet',
  };
}

export async function getOrderMap(orderId: number): Promise<ApiResponse<OrderMapDTO>> {
  if (DEV_MOCK_MODE) {
    const data = mockMapByOrderId[orderId];
    if (!data) {
      return {
        success: false,
        message: 'Mock order not found',
      };
    }
    return {
      success: true,
      data,
      message: 'Mock order map',
    };
  }
  return httpGet<ApiResponse<OrderMapDTO>>(driverUrl.orderMap(orderId));
}

export async function confirmDelivered(orderId: number): Promise<ApiResponse<unknown>> {
  if (DEV_MOCK_MODE) {
    const deliveredOrder = mockDeliveringOrders.find((o) => o.order_id === orderId);
    mockDeliveringOrders = mockDeliveringOrders.filter((o) => o.order_id !== orderId);
    if (deliveredOrder) {
      mockDeliveredHistory = [
        {
          order_id: deliveredOrder.order_id,
          order_code: deliveredOrder.order_code,
          restaurant_name: deliveredOrder.restaurant.name,
          customer_name: deliveredOrder.customer.full_name,
          delivery_address: deliveredOrder.customer.delivery_address,
          delivered_at: new Date().toISOString(),
          payout_amount: 30000,
        },
        ...mockDeliveredHistory,
      ];
    }
    if (mockMapByOrderId[orderId]) {
      mockMapByOrderId[orderId].order_status = 'delivered';
    }
    return {
      success: true,
      message: `Mock confirmed delivered for ${orderId}`,
      data: { order_id: orderId },
    };
  }
  return httpPost(driverUrl.confirmDelivered(orderId), {});
}

