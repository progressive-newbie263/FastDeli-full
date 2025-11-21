import { Metadata } from "next";
import CartClient from "./CartClient";

export const metadata: Metadata = {
  title: 'Giỏ hàng - FoodDeli',
  description: 'Xem và quản lý các món ăn trong giỏ hàng của bạn',
};

export default function CartPage() {
  return <CartClient />;
}