import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: {
    template: '%s | FastDeli Admin',
    default: 'Dashboard | FastDeli Admin',
  },
  description: 'Hệ thống quản trị FastDeli - Quản lý đơn hàng, nhà hàng, người dùng',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}