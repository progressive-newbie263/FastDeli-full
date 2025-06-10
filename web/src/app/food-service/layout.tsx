/*
  -------------------------------------------------------------------------------
  note: 
  -----------------------------------------------------------------------------
  'next/font' đang có 1 lỗi khó hiểu. Tốt nhất lên google font import thẳng về, xài cho nhanh.
*/

'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@food/context/AuthContext';
import Header from '@food/components/layout/Header';
import Footer from '@food/components/layout/Footer';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthPage = pathname === '/food-service/auth/login' || pathname === '/food-service/auth/register';

  return (
    <AuthProvider>
      {!isAuthPage && <Header />}
      
      <main>{children}</main>

      {!isAuthPage && <Footer />}
    </AuthProvider>
  );
}
