'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { adminAPI } from '@/app/utils/api';
import type { RestaurantDetail } from '@/types/admin';

export default function RestaurantDetailPage() {
  const params = useParams();
  const restaurantId = parseInt(params.id as string);
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [restaurantId]);

  const fetchDetail = async () => {
    try {
      const result = await adminAPI.getRestaurantDetail(restaurantId);
      setRestaurant(result.restaurant);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!restaurant) return <div>Không tìm thấy nhà hàng</div>;

  return (
    <AdminLayout title={restaurant.name}>
      {/* Restaurant Info */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Thông tin nhà hàng</h2>
          {/* Display restaurant details */}
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold mb-4">Thống kê</h3>

          {/* thống kê đơn hàng. */}
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Món ăn</p>
              <p className="text-2xl font-bold">{restaurant.stats.total_foods}</p>
            </div>

            <div>
              <p className="text-gray-600 text-sm">Đơn hàng</p>
              <p className="text-2xl font-bold">{restaurant.stats.total_orders}</p>
            </div>

            <div>
              <p className="text-gray-600 text-sm">Doanh thu</p>
              <p className="text-2xl font-bold">{restaurant.stats.total_revenue.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold mb-4">Đơn hàng gần đây</h3>
        <table className="w-full">
          {/* Orders table */}
        </table>
      </div>
    </AdminLayout>
  );
}