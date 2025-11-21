import { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: 'Thông tin đơn hàng - FoodDeli',
  description: 'Xem lại và chỉnh sửa thông tin đơn hàng của bạn nếu cần.',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}