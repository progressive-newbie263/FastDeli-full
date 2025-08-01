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

  const basePath = '/client/food-service';

  const routes = {
    home: `${basePath}`,
    login: `${basePath}/auth/login`,
    register: `${basePath}/auth/register`,
    profile: `${basePath}/profile`
  };

  useEffect(() => {
    if (authLoading) return;

    const isAuthRoute = pathname === routes.login || pathname === routes.register;
    const isProtectedRoute = pathname === routes.profile;

    if (isAuthRoute && isAuthenticated) {
      router.replace(routes.home);
      return;
    }

    if (isProtectedRoute && !isAuthenticated) {
      router.replace(routes.login);
      return;
    }

    const validRoutes = [routes.home, routes.login, routes.register, routes.profile];

    if (!validRoutes.includes(pathname)) {
      router.replace(routes.home);
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
    case routes.login:
      return <Login />;
    case routes.register:
      return <Register />;
    case routes.profile:
      return <Profile />;
    default:
      return <Home />;
  }
}
