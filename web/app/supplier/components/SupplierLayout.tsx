'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSupplierAuth } from '../contexts/SupplierAuthContext';
import SupplierHeader from './SupplierHeader';

interface SupplierLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function SupplierLayout({ children, title, subtitle }: SupplierLayoutProps) {
  const { isAuthenticated, isLoading } = useSupplierAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect to login if not authenticated (except on login page)
    if (!isLoading && !isAuthenticated && pathname !== '/supplier/login') {
      router.push('/supplier/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Don't render layout on login page
  if (pathname === '/supplier/login') {
    return <>{children}</>;
  }

  // Require authentication for all other pages
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SupplierHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        {(title || subtitle) && (
          <div className="mb-8">
            {title && <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>}
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
        )}

        {/* Page content */}
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            © 2026 FastDeli Supplier Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
