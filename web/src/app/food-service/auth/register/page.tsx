"use client";

import { useEffect } from 'react';
import RegisterForm from '@food/components/auth/RegisterForm';
import Link from 'next/link';

const Register = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    // Set page title
    document.title = 'Đăng ký | GrabFood';
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 my-2 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-lg w-full">
        <Link href="/food-service" className="flex justify-center mb-4">
          <img src="/logo/fooddeli-logo.png" className="h-14 w-48" alt="FoodDeli Logo" />
        </Link>
        
        <RegisterForm />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Cần trợ giúp?{' '}
            <a href="#" className="text-blue-800 hover:underline">
              Liên hệ hỗ trợ
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;