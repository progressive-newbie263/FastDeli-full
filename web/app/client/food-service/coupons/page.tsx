import type { Metadata } from "next";
import CouponsClient from "./CouponsClient";

export const metadata: Metadata = {
  title: 'Khuyến mãi - FoodDeli',
  description: 'Xem các chương trình khuyến mãi hiện có của bạn',
};

export default function CouponsPage() {
  return <CouponsClient />;
}


