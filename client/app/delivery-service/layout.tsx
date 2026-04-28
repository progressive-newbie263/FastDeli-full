import { Metadata } from 'next';
import { DeliveryAuthProvider } from './context/DeliveryAuthContext';
import DeliveryHeader from './components/layout/DeliveryHeader';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata: Metadata = {
  title: 'ExpressDeli - Giao hàng hoả tốc',
  description: 'Dịch vụ giao hàng siêu tốc, tin cậy của FastDeli',
};

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DeliveryAuthProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased">
        <DeliveryHeader />
        <main className="flex-grow">
          {children}
        </main>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </DeliveryAuthProvider>
  );
}
