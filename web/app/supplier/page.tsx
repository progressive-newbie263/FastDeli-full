'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupplierAuth } from './contexts/SupplierAuthContext';

export default function SupplierRootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useSupplierAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/supplier/dashboard');
      } else {
        router.push('/supplier/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải...</p>
      </div>
    </div>
  );
}
