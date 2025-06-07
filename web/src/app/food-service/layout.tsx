/*
  -------------------------------------------------------------------------------
  note: 
  -----------------------------------------------------------------------------
  'next/font' đang có 1 lỗi khó hiểu. Tốt nhất lên google font import thẳng về, xài cho nhanh.
*/

import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@food/context/AuthContext";
// import Header from "@food/components/layout/Header";
// import Footer from "@food/components/layout/Footer";

export const metadata: Metadata = {
  title: "FoodDeli - Ăn uống thả ga",
  description: "Thoải mái gọi những món ăn ngon nhất từ các nhà hàng đối tác của chúng tôi. Chúng tôi sẽ giao tận nơi cho bạn.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {/* <Header /> */}

      <main>{children}</main>
      
      {/* <Footer /> */}
    </AuthProvider>
  );
}