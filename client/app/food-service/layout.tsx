/*
  -------------------------------------------------------------------------------
  Layout cho food-service với metadata riêng
  -----------------------------------------------------------------------------
*/
import ClientLayout from './ClientLayout';
import { ToastContainer } from 'react-toastify';

// layout cho food-service
export default function FoodServiceLayout({ children }: { children: React.ReactNode }) {
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