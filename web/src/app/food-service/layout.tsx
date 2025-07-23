/*
  -------------------------------------------------------------------------------
  Layout cho food-service với metadata riêng
  -----------------------------------------------------------------------------
*/
// import type { Metadata } from "next";
import ClientLayout from './ClientLayout';
import { ToastContainer } from 'react-toastify';

// Metadata chỉ có thể export trong server component
// export const metadata: Metadata = {
//   title: "FoodDeli - Đặt đồ ăn trực tuyến",
//   description: "Đặt món ăn yêu thích với FastDeli Food - Giao hàng nhanh chóng, đa dạng món ăn từ các nhà hàng uy tín",
// };

export default function FoodServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientLayout>
      {children}
      <ToastContainer position="top-center" autoClose={3000} />
    </ClientLayout>
  );
}