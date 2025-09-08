'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';

interface SettingSection {
  id: string;
  title: string;
  description: string;
}

const settingSections: SettingSection[] = [
  {
    id: 'general',
    title: 'Cài đặt chung',
    description: 'Thông tin cơ bản về hệ thống'
  },
  {
    id: 'payment',
    title: 'Thanh toán',
    description: 'Cấu hình phương thức thanh toán'
  },
  {
    id: 'delivery',
    title: 'Giao hàng',
    description: 'Cài đặt phí và vùng giao hàng'
  },
  {
    id: 'notification',
    title: 'Thông báo',
    description: 'Cấu hình thông báo hệ thống'
  },
  {
    id: 'security',
    title: 'Bảo mật',
    description: 'Cài đặt bảo mật và quyền truy cập'
  }
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    systemName: 'FoodDeli',
    systemEmail: 'admin@fooddeli.com',
    systemPhone: '1900 1234',
    maintenanceMode: false,
    allowNewRegistrations: true,
    
    // Payment Settings
    enableCashPayment: true,
    enableCardPayment: true,
    enableWalletPayment: true,
    minimumOrderAmount: 50000,
    serviceFeePercentage: 5,
    
    // Delivery Settings
    baseFee: 15000,
    feePerKm: 3000,
    maxDeliveryDistance: 20,
    estimatedDeliveryTime: 30,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderStatusNotifications: true,
    
    // Security Settings
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    requireTwoFactor: false,
    passwordMinLength: 8
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    alert('Cài đặt đã được lưu thành công!');
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tên hệ thống
        </label>
        <input
          type="text"
          value={settings.systemName}
          onChange={(e) => handleSettingChange('systemName', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email hệ thống
        </label>
        <input
          type="email"
          value={settings.systemEmail}
          onChange={(e) => handleSettingChange('systemEmail', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số điện thoại hỗ trợ
        </label>
        <input
          type="tel"
          value={settings.systemPhone}
          onChange={(e) => handleSettingChange('systemPhone', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900">Chế độ bảo trì</h4>
          <p className="text-sm text-gray-600">Tạm khóa hệ thống để bảo trì</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
        </label>
      </div>
      
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900">Cho phép đăng ký mới</h4>
          <p className="text-sm text-gray-600">Người dùng có thể tạo tài khoản mới</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.allowNewRegistrations}
            onChange={(e) => handleSettingChange('allowNewRegistrations', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
        </label>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Tiền mặt</h4>
            <p className="text-sm text-gray-600">COD</p>
          </div>
          <input
            type="checkbox"
            checked={settings.enableCashPayment}
            onChange={(e) => handleSettingChange('enableCashPayment', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded"
          />
        </div>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Thẻ ngân hàng</h4>
            <p className="text-sm text-gray-600">Visa, MasterCard</p>
          </div>
          <input
            type="checkbox"
            checked={settings.enableCardPayment}
            onChange={(e) => handleSettingChange('enableCardPayment', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded"
          />
        </div>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Ví điện tử</h4>
            <p className="text-sm text-gray-600">MoMo, ZaloPay</p>
          </div>
          <input
            type="checkbox"
            checked={settings.enableWalletPayment}
            onChange={(e) => handleSettingChange('enableWalletPayment', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Giá trị đơn hàng tối thiểu (VND)
        </label>
        <input
          type="number"
          value={settings.minimumOrderAmount}
          onChange={(e) => handleSettingChange('minimumOrderAmount', parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phí dịch vụ (%)
        </label>
        <input
          type="number"
          value={settings.serviceFeePercentage}
          onChange={(e) => handleSettingChange('serviceFeePercentage', parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          min="0"
          max="100"
        />
      </div>
    </div>
  );

  const renderDeliverySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phí giao hàng cơ bản (VND)
        </label>
        <input
          type="number"
          value={settings.baseFee}
          onChange={(e) => handleSettingChange('baseFee', parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phí theo km (VND/km)
        </label>
        <input
          type="number"
          value={settings.feePerKm}
          onChange={(e) => handleSettingChange('feePerKm', parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Khoảng cách giao hàng tối đa (km)
        </label>
        <input
          type="number"
          value={settings.maxDeliveryDistance}
          onChange={(e) => handleSettingChange('maxDeliveryDistance', parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thời gian giao hàng ước tính (phút)
        </label>
        <input
          type="number"
          value={settings.estimatedDeliveryTime}
          onChange={(e) => handleSettingChange('estimatedDeliveryTime', parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900">Thông báo Email</h4>
          <p className="text-sm text-gray-600">Gửi thông báo qua email</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
        </label>
      </div>
      
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900">Thông báo SMS</h4>
          <p className="text-sm text-gray-600">Gửi thông báo qua tin nhắn</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.smsNotifications}
            onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
        </label>
      </div>
      
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900">Thông báo Push</h4>
          <p className="text-sm text-gray-600">Thông báo trên ứng dụng di động</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.pushNotifications}
            onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
        </label>
      </div>
      
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900">Thông báo trạng thái đơn hàng</h4>
          <p className="text-sm text-gray-600">Tự động thông báo khi đơn hàng thay đổi</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.orderStatusNotifications}
            onChange={(e) => handleSettingChange('orderStatusNotifications', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
        </label>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thời gian hết hạn phiên (phút)
        </label>
        <input
          type="number"
          value={settings.sessionTimeout}
          onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số lần đăng nhập sai tối đa
        </label>
        <input
          type="number"
          value={settings.maxLoginAttempts}
          onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Độ dài mật khẩu tối thiểu
        </label>
        <input
          type="number"
          value={settings.passwordMinLength}
          onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900">Xác thực hai yếu tố</h4>
          <p className="text-sm text-gray-600">Yêu cầu 2FA cho tài khoản admin</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.requireTwoFactor}
            onChange={(e) => handleSettingChange('requireTwoFactor', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
        </label>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'payment':
        return renderPaymentSettings();
      case 'delivery':
        return renderDeliverySettings();
      case 'notification':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <AdminLayout 
      title="Cài đặt hệ thống" 
      subtitle="Cấu hình và tùy chỉnh hệ thống FoodDeli"
    >
      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 bg-white rounded-xl card-shadow p-6">
          <nav className="space-y-2">
            {settingSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{section.title}</div>
                <div className="text-xs text-gray-500 mt-1">{section.description}</div>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-xl card-shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {settingSections.find(s => s.id === activeSection)?.title}
            </h2>
            <p className="text-gray-600 mt-1">
              {settingSections.find(s => s.id === activeSection)?.description}
            </p>
          </div>
          
          <div className="p-6">
            {renderContent()}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Đặt lại
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}