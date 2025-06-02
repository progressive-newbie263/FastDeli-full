import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./src/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FoodDeli - Ăn uống thả ga",
  description:
    "Thoải mái gọi những món ăn ngon nhất từ các nhà hàng đối tác của chúng tôi. Chúng tôi sẽ giao tận nơi cho bạn.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}