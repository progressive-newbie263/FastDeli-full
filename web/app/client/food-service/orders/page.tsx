import type { Metadata } from 'next';
import OrdersPageClient from './OrdersPageClient';

export const metadata: Metadata = {
  title: 'Lịch sử đặt hàng',
  description: 'Xem lại và quản lý các đơn hàng của bạn',
};

export default async function OrdersPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  return <OrdersPageClient orderId={id} />;
}