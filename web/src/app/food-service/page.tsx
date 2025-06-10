'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@food/context/AuthContext';

import Home from '@food/home/page';
import Login from '@food/auth/login/page';
import Register from '@food/auth/register/page';
import Profile from '@food/profile/page';

export default function App() {
  const [isChecking, setIsChecking] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading) return;

    const isAuthRoute = pathname === '/food-service/auth/login' || pathname === '/food-service/auth/register';
    const isProtectedRoute = pathname === '/food-service/profile';

    if (isAuthRoute && isAuthenticated) {
      router.replace('/food-service');
      return;
    }

    if (isProtectedRoute && !isAuthenticated) {
      router.replace('/food-service/auth/login');
      return;
    }

    const validRoutes = [
      '/food-service',
      '/food-service/auth/login',
      '/food-service/auth/register',
      '/food-service/profile'
    ];

    if (!validRoutes.includes(pathname)) {
      router.replace('/food-service');
      return;
    }

    setIsChecking(false);
  }, [pathname, isAuthenticated, authLoading, router]);

  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  switch (pathname) {
    case '/food-service/auth/login':
      return <Login />;
    case '/food-service/auth/register':
      return <Register />;
    case '/food-service/profile':
      return <Profile />;
    default:
      return <Home />;
  }
}
