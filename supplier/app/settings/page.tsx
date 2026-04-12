'use client';

import React, { useEffect, useRef, useState } from 'react';
import SupplierLayout from '../components/SupplierLayout';
import Modal from '../components/Modal';
import { useSupplierAuth } from '../contexts/SupplierAuthContext';
import SupplierAPI from '../lib/api';
import type { Restaurant } from '../types';
import { Save, MapPin, Phone, Mail, Clock, DollarSign, Upload } from 'lucide-react';

const DEFAULT_COUPON_IMAGE_URL = 'https://res.cloudinary.com/dpldznnma/image/upload/v1759474917/discount-default-thumbnail.png';

export default function SettingsPage() {
  const { restaurant, refreshRestaurantData } = useSupplierAuth();
  const [formData, setFormData] = useState<Partial<Restaurant>>({});
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<number | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);
  const [pendingCouponImageFile, setPendingCouponImageFile] = useState<File | null>(null);
  const [couponPreviewUrl, setCouponPreviewUrl] = useState<string | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    title: '',
    description: '',
    image_url: DEFAULT_COUPON_IMAGE_URL,
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
  const [uploadingCouponImage, setUploadingCouponImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const couponImageInputRef = useRef<HTMLInputElement>(null);

  const normalizeCouponDateForInput = (rawDate: unknown) => {
    if (!rawDate) return '';
    const text = String(rawDate);
    if (text.includes('T')) return text.split('T')[0];
    if (text.includes(' ')) return text.split(' ')[0];
    return text.slice(0, 10);
  };

  const toCouponApiDateTime = (date: string, endOfDay: boolean) => {
    if (!date) return '';
    return `${date}T${endOfDay ? '23:59:59' : '00:00:00'}`;
  };

  const getCouponKey = (coupon: any) => {
    if (coupon?.coupon_key) return String(coupon.coupon_key);
    if (coupon?.id && coupon?.restaurant_id) return `R${coupon.restaurant_id}-CP${coupon.id}`;
    return null;
  };

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

  const clearPendingCouponImage = () => {
    if (couponPreviewUrl) {
      URL.revokeObjectURL(couponPreviewUrl);
    }
    setCouponPreviewUrl(null);
    setPendingCouponImageFile(null);
  };

  useEffect(() => {
    return () => {
      if (couponPreviewUrl) {
        URL.revokeObjectURL(couponPreviewUrl);
      }
    };
  }, [couponPreviewUrl]);

  const handleCreateCoupon = async () => {
    if (!restaurant?.id) return;

    try {
      setCreatingCoupon(true);
      setCouponFeedback(null);
      const wasEditing = editingCouponId !== null;
      const payload = {
        ...couponForm,
        start_date: toCouponApiDateTime(couponForm.start_date, false),
        end_date: toCouponApiDateTime(couponForm.end_date, true),
        max_discount: couponForm.max_discount > 0 ? couponForm.max_discount : null,
      };
      const response = editingCouponId
        ? await SupplierAPI.updateMyCoupon(restaurant.id, editingCouponId, payload)
        : await SupplierAPI.createMyCoupon(restaurant.id, payload);
      if (!response.success) {
        setCouponFeedback(response.message || (editingCouponId ? 'Cập nhật coupon thất bại' : 'Tạo coupon thất bại'));
        return;
      }

      let uploadedCouponImage = false;
      if (!wasEditing && pendingCouponImageFile) {
        const createdCouponId = Number(response?.data?.id);
        if (Number.isFinite(createdCouponId) && createdCouponId > 0) {
          const uploadResponse = await SupplierAPI.uploadCouponImage(createdCouponId, pendingCouponImageFile);
          uploadedCouponImage = Boolean(uploadResponse.success);
        }
      }

      setCouponForm({
        code: '',
        title: '',
        description: '',
        image_url: DEFAULT_COUPON_IMAGE_URL,
        discount_type: 'fixed_amount',
        discount_value: 10000,
        min_order_value: 0,
        max_discount: 0,
        start_date: '',
        end_date: '',
      });
      setEditingCouponId(null);
      clearPendingCouponImage();
      await loadCoupons(restaurant.id);
      const savedCoupon = response?.data || null;
      const couponKey = getCouponKey(savedCoupon);
      setCouponFeedback(
        wasEditing
          ? `Cập nhật coupon thành công${couponKey ? ` (Key: ${couponKey})` : ''}`
          : `Tạo coupon thành công${couponKey ? ` (Key: ${couponKey})` : ''}${pendingCouponImageFile ? (uploadedCouponImage ? ' + ảnh coupon' : ' (ảnh coupon chưa upload được)') : ''}`
      );
      setIsCouponModalOpen(false);
    } catch (error) {
      setCouponFeedback(editingCouponId ? 'Lỗi khi cập nhật coupon' : 'Lỗi khi tạo coupon');
    } finally {
      setCreatingCoupon(false);
    }
  };

  const handleEditCoupon = (coupon: any) => {
    clearPendingCouponImage();
    setEditingCouponId(Number(coupon.id));
    setCouponFeedback(null);
    setCouponForm({
      code: String(coupon.code || ''),
      title: String(coupon.title || ''),
      description: String(coupon.description || ''),
      image_url: String(coupon.image_url || DEFAULT_COUPON_IMAGE_URL),
      discount_type: coupon.discount_type === 'percentage' ? 'percentage' : 'fixed_amount',
      discount_value: Number(coupon.discount_value || 0),
      min_order_value: Number(coupon.min_order_value || 0),
      max_discount: Number(coupon.max_discount || 0),
      start_date: normalizeCouponDateForInput(coupon.start_date),
      end_date: normalizeCouponDateForInput(coupon.end_date),
    });
    setIsCouponModalOpen(true);
  };

  const resetCouponForm = () => {
    clearPendingCouponImage();
    setEditingCouponId(null);
    setCouponFeedback(null);
    setCouponForm({
      code: '',
      title: '',
      description: '',
      image_url: DEFAULT_COUPON_IMAGE_URL,
      discount_type: 'fixed_amount',
      discount_value: 10000,
      min_order_value: 0,
      max_discount: 0,
      start_date: '',
      end_date: '',
    });
  };

  const openCreateCouponModal = () => {
    resetCouponForm();
    setIsCouponModalOpen(true);
  };

  const handleCouponImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    if (!restaurant?.id) {
      alert('Không tìm thấy thông tin nhà hàng');
      return;
    }

    try {
      setUploadingCouponImage(true);
      const file = e.target.files[0];

      if (editingCouponId) {
        const response = await SupplierAPI.uploadCouponImage(editingCouponId, file);
        const imageUrl = response.data?.url || (response as unknown as { url?: string }).url;

        if (response.success && imageUrl) {
          setCouponForm((prev) => ({ ...prev, image_url: imageUrl }));
          await loadCoupons(restaurant.id);
          return;
        }

        alert(response.message || 'Upload ảnh coupon thất bại');
        return;
      }

      if (couponPreviewUrl) {
        URL.revokeObjectURL(couponPreviewUrl);
      }
      const previewUrl = URL.createObjectURL(file);
      setCouponPreviewUrl(previewUrl);
      setPendingCouponImageFile(file);
      setCouponFeedback('Ảnh coupon sẽ được upload sau khi tạo coupon thành công.');
    } catch (error) {
      alert('Lỗi khi upload ảnh coupon');
    } finally {
      setUploadingCouponImage(false);
      e.target.value = '';
    }
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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Coupon của nhà hàng</h2>
              <p className="text-sm text-gray-600 mt-1">
                Coupon tạo tại đây áp dụng cho khách hàng đặt món thuộc nhà hàng của bạn và sẽ hiển thị ở supplier, admin, customer.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateCouponModal}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Tạo coupon
            </button>
          </div>

          {couponFeedback && (
            <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-orange-700">
              {couponFeedback}
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">Danh sách coupon đã tạo</h3>
            {couponLoading ? (
              <p className="text-sm text-gray-500">Đang tải...</p>
            ) : coupons.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có coupon nào.</p>
            ) : (
              coupons.map((coupon) => {
                const imageUrl = coupon.image_url || DEFAULT_COUPON_IMAGE_URL;
                return (
                  <div key={coupon.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <img
                        src={imageUrl}
                        alt={coupon.title || coupon.code}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-gray-900 truncate max-w-[70%]">
                            {coupon.code} {coupon.title ? `- ${coupon.title}` : ''}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full border ${coupon.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                            {coupon.is_active ? 'Bật' : 'Tắt'}
                          </span>
                        </div>

                        <div className="mt-1 text-sm text-gray-700 truncate">
                          {
                            coupon.discount_type === 'percentage'
                            ? `Giảm ${coupon.discount_value}%`
                            : `Giảm ${Number(coupon.discount_value).toLocaleString('vi-VN')}đ`
                          } 
                          
                          {/* 
                            note: 
                            - min_order_value có thể là null, undefined, 0 hoặc số dương. 
                            - Hiển thị khi có giá trị > 0
                          */}

                          {
                            coupon.min_order_value !== null 
                            && coupon.min_order_value !== undefined 
                            && coupon.min_order_value > 0 
                            && ` | Tối thiểu ${Number(coupon.min_order_value || 0).toLocaleString('vi-VN')}đ`
                          }
                        </div>

                        {getCouponKey(coupon) && (
                          <p className="text-[11px] text-gray-500 mt-1 truncate">Key: {getCouponKey(coupon)}</p>
                        )}

                        <div className="mt-1.5 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleEditCoupon(coupon)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Chỉnh sửa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <Modal
          isOpen={isCouponModalOpen}
          onClose={() => setIsCouponModalOpen(false)}
          title={editingCouponId ? 'Chỉnh sửa coupon' : 'Tạo coupon mới'}
          size="md"
        >
          <form onSubmit={handleCouponSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã coupon *</label>
                <input
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="VD: BUNCHA20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề coupon</label>
                <input
                  value={couponForm.title}
                  onChange={(e) => setCouponForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Giảm giá cho khách mới"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại giảm giá *</label>
                <select
                  value={couponForm.discount_type}
                  onChange={(e) => setCouponForm((p) => ({ ...p, discount_type: e.target.value as 'fixed_amount' | 'percentage' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                >
                  <option value="fixed_amount">Giảm số tiền cố định</option>
                  <option value="percentage">Giảm theo %</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giá trị giảm *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={couponForm.discount_value}
                  onChange={(e) => setCouponForm((p) => ({ ...p, discount_value: Number(e.target.value) }))}
                  placeholder="10000 hoặc 20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Đơn tối thiểu (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  value={couponForm.min_order_value}
                  onChange={(e) => setCouponForm((p) => ({ ...p, min_order_value: Number(e.target.value) }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mức giảm tối đa (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  value={couponForm.max_discount}
                  onChange={(e) => setCouponForm((p) => ({ ...p, max_discount: Number(e.target.value) }))}
                  placeholder="0 = không giới hạn"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu *</label>
                <input
                  type="date"
                  required
                  value={couponForm.start_date}
                  onChange={(e) => setCouponForm((p) => ({ ...p, start_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc *</label>
                <input
                  type="date"
                  required
                  value={couponForm.end_date}
                  onChange={(e) => setCouponForm((p) => ({ ...p, end_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả coupon</label>
              <textarea
                value={couponForm.description}
                onChange={(e) => setCouponForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Mô tả điều kiện áp dụng"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh coupon</label>
              <div className="flex items-center gap-3">
                <input
                  ref={couponImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCouponImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => couponImageInputRef.current?.click()}
                  disabled={uploadingCouponImage}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <Upload size={16} />
                  {uploadingCouponImage ? 'Đang upload...' : 'Tải ảnh lên'}
                </button>
                <button
                  type="button"
                  onClick={() => setCouponForm((p) => ({ ...p, image_url: DEFAULT_COUPON_IMAGE_URL }))}
                  className="px-3 py-2 text-sm bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Dùng ảnh mặc định
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Ảnh sẽ được đính kèm vào coupon khi lưu.</p>
              <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={couponPreviewUrl || couponForm.image_url || DEFAULT_COUPON_IMAGE_URL}
                  alt="Coupon preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={creatingCoupon}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {creatingCoupon
                  ? (editingCouponId ? 'Đang cập nhật...' : 'Đang tạo...')
                  : (editingCouponId ? 'Lưu chỉnh sửa coupon' : 'Tạo coupon nhà hàng')}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </SupplierLayout>
  );
}
