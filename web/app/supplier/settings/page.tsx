'use client';

import React, { useEffect, useRef, useState } from 'react';
import SupplierLayout from '../components/SupplierLayout';
import { useSupplierAuth } from '../contexts/SupplierAuthContext';
import SupplierAPI from '../lib/api';
import type { Restaurant } from '../types';
import { Save, MapPin, Phone, Mail, Clock, DollarSign, Upload } from 'lucide-react';

export default function SettingsPage() {
  const { restaurant, refreshRestaurantData } = useSupplierAuth();
  const [formData, setFormData] = useState<Partial<Restaurant>>({});
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<number | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    title: '',
    description: '',
    discount_type: 'fixed_amount' as 'fixed_amount' | 'percentage',
    discount_value: 10000,
    min_order_value: 0,
    max_discount: 0,
    start_date: '',
    end_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (restaurant) {
      setFormData(restaurant);
      void loadCoupons(restaurant.id);
    }
  }, [restaurant]);

  const loadCoupons = async (restaurantId: number) => {
    try {
      setCouponLoading(true);
      const response = await SupplierAPI.getMyCoupons(restaurantId);
      if (response.success && response.data?.coupons) {
        setCoupons(response.data.coupons);
      }
    } catch (error) {
      console.error('Không thể tải coupons:', error);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (!restaurant?.id) return;

    try {
      setCreatingCoupon(true);
      const payload = {
        ...couponForm,
        max_discount: couponForm.max_discount > 0 ? couponForm.max_discount : null,
      };
      const response = editingCouponId
        ? await SupplierAPI.updateMyCoupon(restaurant.id, editingCouponId, payload)
        : await SupplierAPI.createMyCoupon(restaurant.id, payload);
      if (!response.success) {
        alert(response.message || (editingCouponId ? 'Cập nhật coupon thất bại' : 'Tạo coupon thất bại'));
        return;
      }

      setCouponForm({
        code: '',
        title: '',
        description: '',
        discount_type: 'fixed_amount',
        discount_value: 10000,
        min_order_value: 0,
        max_discount: 0,
        start_date: '',
        end_date: '',
      });
      setEditingCouponId(null);
      await loadCoupons(restaurant.id);
      alert(editingCouponId ? 'Cập nhật coupon thành công' : 'Tạo coupon thành công');
    } catch (error) {
      alert(editingCouponId ? 'Lỗi khi cập nhật coupon' : 'Lỗi khi tạo coupon');
    } finally {
      setCreatingCoupon(false);
    }
  };

  const handleEditCoupon = (coupon: any) => {
    setEditingCouponId(Number(coupon.id));
    setCouponForm({
      code: String(coupon.code || ''),
      title: String(coupon.title || ''),
      description: String(coupon.description || ''),
      discount_type: coupon.discount_type === 'percentage' ? 'percentage' : 'fixed_amount',
      discount_value: Number(coupon.discount_value || 0),
      min_order_value: Number(coupon.min_order_value || 0),
      max_discount: Number(coupon.max_discount || 0),
      start_date: coupon.start_date ? String(coupon.start_date).slice(0, 16) : '',
      end_date: coupon.end_date ? String(coupon.end_date).slice(0, 16) : '',
    });
  };

  const resetCouponForm = () => {
    setEditingCouponId(null);
    setCouponForm({
      code: '',
      title: '',
      description: '',
      discount_type: 'fixed_amount',
      discount_value: 10000,
      min_order_value: 0,
      max_discount: 0,
      start_date: '',
      end_date: '',
    });
  };

  const handleRestaurantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    if (!restaurant?.id) {
      alert('Không tìm thấy thông tin nhà hàng');
      return;
    }

    try {
      setUploadingImage(true);
      const response = await SupplierAPI.uploadRestaurantImage(restaurant.id, e.target.files[0]);
      const imageUrl = response.data?.url || (response as unknown as { url?: string }).url;

      if (response.success && imageUrl) {
        setFormData((prev) => ({ ...prev, image_url: imageUrl }));
        await refreshRestaurantData();
        alert('Upload ảnh thành công! Nhấn "Lưu thay đổi" để cập nhật toàn bộ thông tin khác nếu cần.');
      } else {
        alert(response.message || 'Upload ảnh thất bại');
      }
    } catch (error) {
      alert('Lỗi khi upload ảnh nhà hàng');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!restaurant?.id) {
      alert('Không tìm thấy thông tin nhà hàng');
      return;
    }

    try {
      setLoading(true);
      setSuccess(false);

      const response = await SupplierAPI.updateRestaurant(restaurant.id, formData);

      if (response.success) {
        setSuccess(true);
        // Update local form data with response data if available
        if (response.data) {
          setFormData(response.data);
        }
        await refreshRestaurantData();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert(response.message || 'Không thể cập nhật thông tin');
      }
    } catch (error) {
      alert('Lỗi khi cập nhật thông tin nhà hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCreateCoupon();
  };

  return (
    <SupplierLayout title="Cài đặt nhà hàng" subtitle="Cập nhật thông tin và cấu hình">
      <div className="max-w-4xl">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            Cập nhật thông tin thành công!
          </div>
        )}

        <form onSubmit={handleSubmit}>

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin cơ bản</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên nhà hàng *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
              <textarea
                rows={4}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black"
                placeholder="Giới thiệu về nhà hàng của bạn..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện nhà hàng</label>
              <div className="flex items-center gap-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
                <div className="w-48 h-32 rounded-lg border border-gray-200 overflow-hidden bg-white flex items-center justify-center">
                  {formData.image_url ? (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-400">Chưa có ảnh</span>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleRestaurantImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Upload size={16} />
                    {uploadingImage ? 'Đang upload...' : 'Tải ảnh lên'}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">Ảnh sẽ được lưu trên Cloudinary</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Phone size={20} />
            Thông tin liên hệ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
              <input
                type="tel"
                required
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} />
              Địa chỉ *
            </label>
            <input
              type="text"
              required
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black"
            />
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} />
            Giờ hoạt động
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giờ mở cửa</label>
              <input
                type="time"
                value={formData.opening_time || ''}
                onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giờ đóng cửa</label>
              <input
                type="time"
                value={formData.closing_time || ''}
                onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black"
              />
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={20} />
            Cài đặt giao hàng
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phí giao hàng (VNĐ)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.delivery_fee || 0}
                onChange={(e) => setFormData({ ...formData, delivery_fee: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black"
                placeholder="15000"
              />
              <p className="text-xs text-gray-500 mt-1">Phí ship mặc định cho khách hàng</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giao hàng tối thiểu (phút)</label>
              <input
                type="number"
                min="0"
                value={formData.delivery_time_min ?? 0}
                onChange={(e) => setFormData({ ...formData, delivery_time_min: Number(e.target.value) })}
                placeholder="30"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giao hàng tối đa (phút)</label>
              <input
                type="number"
                min="0"
                value={formData.delivery_time_max ?? 0}
                onChange={(e) => setFormData({ ...formData, delivery_time_max: Number(e.target.value) })}
                placeholder="45"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đơn tối thiểu (VNĐ)</label>
              <input
                type="number"
                min="0"
                value={formData.min_order_value || 0}
                onChange={(e) => setFormData({ ...formData, min_order_value: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black"
              />
            </div>
          </div>
        </div>

        {/* Location (Optional) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={20} />
            Vị trí (Tọa độ)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vĩ độ (Latitude)</label>
              <input
                type="number"
                step="0.000001"
                value={formData.latitude || ''}
                onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black"
                placeholder="10.762622"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kinh độ (Longitude)</label>
              <input
                type="number"
                step="0.000001"
                value={formData.longitude || ''}
                onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black"
                placeholder="106.660172"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Tọa độ giúp hiển thị chính xác vị trí nhà hàng trên bản đồ cho khách hàng
          </p>
        </div>

        {/* Submit button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={20} />
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>

          <button
            type="button"
            onClick={() => setFormData(restaurant || {})}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Hủy
          </button>
        </div>

        {/* Restaurant Status */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Trạng thái nhà hàng</h3>
          <p className="text-sm text-blue-700">
            Trạng thái hiện tại:{' '}
            <span className="font-bold">
              {restaurant?.status === 'active'
                ? 'Đang hoạt động'
                : restaurant?.status === 'pending'
                ? 'Chờ duyệt'
                : restaurant?.status === 'rejected'
                ? 'Bị từ chối'
                : 'Tạm dừng'}
            </span>
          </p>
          {restaurant?.status !== 'active' && (
            <p className="text-xs text-blue-600 mt-1">
              Liên hệ admin để kích hoạt hoặc thay đổi trạng thái nhà hàng
            </p>
          )}
        </div>
        </form>

        <form onSubmit={handleCouponSubmit} className="mt-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Coupon của nhà hàng</h2>
          <p className="text-sm text-gray-600 mb-4">
            Coupon tạo tại đây chỉ áp dụng cho đơn hàng thuộc nhà hàng của bạn.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
              required
              value={couponForm.code}
              onChange={(e) => setCouponForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
              placeholder="Mã coupon (VD: BUNCHA20)"
              className="px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
            <input
              value={couponForm.title}
              onChange={(e) => setCouponForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Tiêu đề coupon"
              className="px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
            <select
              value={couponForm.discount_type}
              onChange={(e) => setCouponForm((p) => ({ ...p, discount_type: e.target.value as 'fixed_amount' | 'percentage' }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-black"
            >
              <option value="fixed_amount">Giảm số tiền cố định</option>
              <option value="percentage">Giảm theo %</option>
            </select>
            <input
              type="number"
              min="1"
              required
              value={couponForm.discount_value}
              onChange={(e) => setCouponForm((p) => ({ ...p, discount_value: Number(e.target.value) }))}
              placeholder="Giá trị giảm"
              className="px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
            <input
              type="number"
              min="0"
              value={couponForm.min_order_value}
              onChange={(e) => setCouponForm((p) => ({ ...p, min_order_value: Number(e.target.value) }))}
              placeholder="Đơn tối thiểu"
              className="px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
            <input
              type="number"
              min="0"
              value={couponForm.max_discount}
              onChange={(e) => setCouponForm((p) => ({ ...p, max_discount: Number(e.target.value) }))}
              placeholder="Mức giảm tối đa (nếu có)"
              className="px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
            <input
              type="datetime-local"
              required
              value={couponForm.start_date}
              onChange={(e) => setCouponForm((p) => ({ ...p, start_date: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
            <input
              type="datetime-local"
              required
              value={couponForm.end_date}
              onChange={(e) => setCouponForm((p) => ({ ...p, end_date: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
            <textarea
              value={couponForm.description}
              onChange={(e) => setCouponForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Mô tả coupon"
              className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-black"
            />

            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={creatingCoupon}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {creatingCoupon
                  ? (editingCouponId ? 'Đang cập nhật...' : 'Đang tạo...')
                  : (editingCouponId ? 'Lưu chỉnh sửa coupon' : 'Tạo coupon nhà hàng')}
              </button>
              {editingCouponId && (
                <button
                  type="button"
                  onClick={resetCouponForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Hủy chỉnh sửa
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">Danh sách coupon đã tạo</h3>
            {couponLoading ? (
              <p className="text-sm text-gray-500">Đang tải...</p>
            ) : coupons.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có coupon nào.</p>
            ) : (
              coupons.map((coupon) => (
                <div key={coupon.id} className="rounded-lg border border-gray-200 p-3">
                  <p className="font-semibold text-gray-900">{coupon.code} {coupon.title ? `- ${coupon.title}` : ''}</p>
                  <p className="text-sm text-gray-600">
                    {coupon.discount_type === 'percentage'
                      ? `Giảm ${coupon.discount_value}%`
                      : `Giảm ${Number(coupon.discount_value).toLocaleString('vi-VN')}đ`}
                    {' '}| Đơn tối thiểu {Number(coupon.min_order_value || 0).toLocaleString('vi-VN')}đ
                  </p>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => handleEditCoupon(coupon)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        </form>
      </div>
    </SupplierLayout>
  );
}
