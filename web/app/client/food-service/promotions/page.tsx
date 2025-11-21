import type { Metadata } from "next";
import PromotionsClient from "./PromotionsClient";

export const metadata: Metadata = {
  title: 'Khuyến mãi - FoodDeli',
  description: 'Xem các chương trình khuyến mãi hiện có của bạn',
};

export default function PromotionsPage() {
  return <PromotionsClient />;
}


