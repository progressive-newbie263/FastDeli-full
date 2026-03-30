'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, User, Mail, Phone, Lock, MapPin, FileText } from 'lucide-react';
import SupplierAPI from '../lib/api';

export default function SupplierRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    restaurant_name: '',
    restaurant_address: '',
    restaurant_phone: '',
    description: '',
    delivery_fee: 0,
    min_order_value: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await SupplierAPI.registerPartner({
        ...form,
        delivery_time_min: 30,
        delivery_time_max: 45,
      });

      if (!response.success) {
        setError(response.message || 'Đăng ký đối tác thất bại.');
        return;
      }

      setSuccessMessage('Đăng ký thành công. Nhà hàng đang chờ admin duyệt, bạn có thể đăng nhập sau khi được duyệt.');
      setTimeout(() => {
        router.push('/supplier/login');
      }, 2000);
    } catch (_err) {
      setError('Đã xảy ra lỗi khi đăng ký đối tác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-full mb-3">
            <Store className="text-white" size={30} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Đăng ký nhà hàng đối tác</h1>
          <p className="text-gray-600 mt-2">Tạo tài khoản nhà hàng và gửi hồ sơ chờ duyệt</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
          {successMessage && <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">{successMessage}</div>}

          <div className="grid md:grid-cols-2 gap-4">
            <InputField icon={<User size={18} />} label="Tên chủ nhà hàng" value={form.full_name} onChange={(v) => setForm((p) => ({ ...p, full_name: v }))} required />
            <InputField icon={<Mail size={18} />} type="email" label="Email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} required />
            <InputField icon={<Phone size={18} />} label="SĐT chủ tài khoản" value={form.phone_number} onChange={(v) => setForm((p) => ({ ...p, phone_number: v }))} required />
            <InputField icon={<Lock size={18} />} type="password" label="Mật khẩu" value={form.password} onChange={(v) => setForm((p) => ({ ...p, password: v }))} required />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <InputField icon={<Store size={18} />} label="Tên nhà hàng" value={form.restaurant_name} onChange={(v) => setForm((p) => ({ ...p, restaurant_name: v }))} required />
            <InputField icon={<Phone size={18} />} label="SĐT nhà hàng" value={form.restaurant_phone} onChange={(v) => setForm((p) => ({ ...p, restaurant_phone: v }))} required />
          </div>

          <InputField icon={<MapPin size={18} />} label="Địa chỉ nhà hàng" value={form.restaurant_address} onChange={(v) => setForm((p) => ({ ...p, restaurant_address: v }))} required />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả nhà hàng</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={4}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500"
                placeholder="Nhà hàng chuyên món gì, điểm nổi bật..."
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              icon={<Store size={18} />}
              type="number"
              label="Phí giao mặc định (VNĐ)"
              value={String(form.delivery_fee)}
              onChange={(v) => setForm((p) => ({ ...p, delivery_fee: Number(v || 0) }))}
            />
            <InputField
              icon={<Store size={18} />}
              type="number"
              label="Đơn tối thiểu (VNĐ)"
              value={String(form.min_order_value)}
              onChange={(v) => setForm((p) => ({ ...p, min_order_value: Number(v || 0) }))}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Đang gửi hồ sơ...' : 'Gửi đăng ký đối tác'}
          </button>

          <p className="text-sm text-gray-600 text-center">
            Đã có tài khoản? <Link href="/supplier/login" className="text-orange-600 font-medium hover:text-orange-700">Đăng nhập</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function InputField({
  icon,
  label,
  value,
  onChange,
  required = false,
  type = 'text',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}{required ? ' *' : ''}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500"
        />
      </div>
    </div>
  );
}
