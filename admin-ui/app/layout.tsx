import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FoodDeli Admin - Quản lý hệ thống',
  description: 'Hệ thống quản lý đơn hàng và nhà hàng FoodDeli',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}