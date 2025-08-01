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

      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false} // rtl = right-to-left (thời gian tiêu biến hiển thị từ phải sang trái) 
        pauseOnFocusLoss // hover toast để tạm dừng thời gian tiêu biến
        draggable
        pauseOnHover
        className="custom-toast-container"
        toastClassName="custom-toast"
      />
    </ClientLayout>
  );
}