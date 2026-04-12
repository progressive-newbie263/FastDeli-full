import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: '%s',
    default: 'FastDeli - Vận chuyển hoả tốc',
  },
  description: 'Đi lại, ăn uống, vận chuyển hàng hoá một cách nhanh chóng',
  keywords: [
    'đặt đồ ăn', 
    'giao hàng nhanh', 
    'thuê xe máy', 
    'FastDeli'
  ],
  authors: [{ 
    name: 'FastDeli Team' 
  }],
  openGraph: {
    title: 'FastDeli - Vận chuyển hoả tốc',
    description: 'Đi lại, ăn uống, vận chuyển hàng hoá một cách nhanh chóng',
    type: 'website',
    locale: 'vi_VN',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}