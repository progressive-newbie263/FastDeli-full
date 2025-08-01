'use client';

import { useEffect } from 'react';
import LoginForm from '@food/components/auth/LoginForm';
import Link from 'next/link';

export default function Login() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Đăng nhập | FoodDeli";
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">      
        <Link href="/food-service" className="flex justify-center mb-8">
          <img src="/logo/fooddeli-logo.png" className="h-14 w-48" alt="FoodDeli Logo" />
        </Link>

        <LoginForm />

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Gặp sự cố khi đăng nhập?{' '}
            <a href="#" className="text-blue-800 hover:underline">
              Liên hệ hỗ trợ
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}