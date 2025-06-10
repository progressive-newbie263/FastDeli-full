import type { Metadata } from "next";
//import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// export const metadata: Metadata = {
//   title: "FastDeli - Vận chuyển hoả tốc",
//   description:
//     "Đi lại, ăn uống, vận chuyển hàng hoá một cách nhanh chóng ... chúng tôi sẽ cung cấp tất cả cho bạn",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
