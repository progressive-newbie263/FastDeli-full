import { Metadata } from "next";
import RestaurantClient from "./RestaurantClient";

export const metadata: Metadata = {
  title: 'Danh sách nhà hàng',
  description: 'Khám phá các nhà hàng ngon gần bạn',
};

export default function RestaurantPage() {
  return <RestaurantClient />;
}