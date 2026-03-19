'use client';

import React, { useEffect, useState } from 'react';
import SupplierLayout from '../components/SupplierLayout';
import { useSupplierAuth } from '../contexts/SupplierAuthContext';
import SupplierAPI from '../lib/api';
import type { Restaurant } from '../types';
import { Save, MapPin, Phone, Mail, Clock, DollarSign, Image as ImageIcon, Loader } from 'lucide-react';

export default function ProfilePage() {
  const { restaurant, refreshRestaurant, isLoading: authLoading } = useSupplierAuth();
  const [formData, setFormData] = useState<Partial<Restaurant>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
        description: restaurant.description || '',
        image_url: restaurant.image_url || '',
        delivery_time_min: restaurant.delivery_time_min ?? 30,
        delivery_time_max: restaurant.delivery_time_max ?? 45,
        delivery_fee: restaurant.delivery_fee || 0,
        min_order_value: restaurant.min_order_value || 0,
        opening_time: restaurant.opening_time || '',
        closing_time: restaurant.closing_time || '',
      });
      setLoading(false);
    }
  }, [restaurant, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurant?.id) {
      setMessage({ type: 'error', text: 'Không tìm thấy thông tin nhà hàng' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      const response = await SupplierAPI.updateRestaurant(restaurant.id, formData);

      if (response.success) {
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
        // Refresh restaurant data in context
        await refreshRestaurant();
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: response.message || 'Không thể cập nhật thông tin' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi khi cập nhật thông tin' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof Restaurant, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <SupplierLayout title="Thông tin nhà hàng" subtitle="Cập nhật thông tin nhà hàng của bạn">
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin text-orange-600" size={48} />
        </div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout title="Thông tin nhà hàng" subtitle="Cập nhật thông tin nhà hàng của bạn">
      {/* Status message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Restaurant Image */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon size={20} />
            Hình ảnh nhà hàng
          </h2>
          
          <div className="space-y-4">
            {formData.image_url && (
              <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={formData.image_url}
                  alt="Restaurant"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL hình ảnh</label>
              <input
                type="url"
                value={formData.image_url || ''}
                onChange={(e) => handleChange('image_url', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black focus:border-transparent"
                placeholder="https://example.com/restaurant-image.jpg"
              />
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên nhà hàng *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} />
                Địa chỉ *
              </label>
              <input
                type="text"
                required
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} />
                Số điện thoại *
              </label>
              <input
                type="tel"
                required
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
              <textarea
                rows={4}
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black focus:border-transparent"
                placeholder="Giới thiệu về nhà hàng của bạn..."
              />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} />
            Giờ hoạt động
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giờ mở cửa</label>
              <input
                type="time"
                value={formData.opening_time || ''}
                onChange={(e) => handleChange('opening_time', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giờ đóng cửa</label>
              <input
                type="time"
                value={formData.closing_time || ''}
                onChange={(e) => handleChange('closing_time', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={20} />
            Cài đặt giao hàng
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giao hàng tối thiểu (phút)</label>
              <input
                type="number"
                min="0"
                value={formData.delivery_time_min ?? 0}
                onChange={(e) => handleChange('delivery_time_min', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black focus:border-transparent"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giao hàng tối đa (phút)</label>
              <input
                type="number"
                min="0"
                value={formData.delivery_time_max ?? 0}
                onChange={(e) => handleChange('delivery_time_max', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black focus:border-transparent"
                placeholder="45"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phí giao hàng (VNĐ)</label>
              <input
                type="number"
                min="0"
                value={formData.delivery_fee || 0}
                onChange={(e) => handleChange('delivery_fee', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đơn hàng tối thiểu (VNĐ)</label>
              <input
                type="number"
                min="0"
                value={formData.min_order_value || 0}
                onChange={(e) => handleChange('min_order_value', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <>
                <Loader className="animate-spin" size={20} />
                Đang lưu...
              </>
            ) : (
              <>
                <Save size={20} />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>
    </SupplierLayout>
  );
}
