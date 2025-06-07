"use client";

import { useEffect } from 'react';
import RegisterForm from '@food/components/auth/RegisterForm';

const Register = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    // Set page title
    document.title = 'Đăng ký | GrabFood';
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-orange-500 text-3xl font-bold">GrabFood</h1>
          <p className="mt-2 text-gray-600">Tạo tài khoản mới</p>
        </div>
        
        <RegisterForm />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Cần trợ giúp?{' '}
            <a href="#" className="text-orange-500 hover:text-orange-600">
              Liên hệ hỗ trợ
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;