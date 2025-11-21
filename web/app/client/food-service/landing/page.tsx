import Footer from '@client/components/Footer';
import Navbar from '@client/components/Navbar';
import PartnerButton from '@client/components/PartnerButton';
import Image from 'next/image';
import Intro from '@client/components/landing-bike/Intro';
import Guidance from '@client/components/landing-bike/Guidance';
import Link from 'next/link';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Đặt đồ ăn online cùng FoodDeli",
  description: "Đi lại, ăn uống, order một cách nhanh chóng cùng FoodDeli",
};


export default function FoodPage() {
  return (
    <div className="bg-white min-h-screen text-black">
      <Navbar />
      <PartnerButton />

      {/* ảnh nền + giới thiệu */}
      <div className="relative w-full h-[550px]">
        <Image
          src="/assets/food-images/shared-food-image.jpg"
          alt="food-shared-img"
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 items-center bg-black/40 text-white">
          <div className="flex flex-col absolute top-48 left-20 md:left-50">
            <h2 className="text-white text-5xl font-semibold">FoodDeli</h2>

            <p className="mt-2 text-[18px]">Thèm món gì, đặt ngay món đó!</p>

            <Link
              href="/client/food-service"
              className="w-48 bg-green-600 py-2 text-center rounded-md text-[16px] hover:bg-green-700 cursor-pointer duration-300 ease-in-out mt-16 mb-4"
            >
              Đặt hàng ngay
            </Link>

            <p className="max-w-[350px]">
              Trở thành Đối tác Nhà hàng của FoodDeli ngay!
              &nbsp;
              <span className="text-blue-300">
                <a href="#">Ấn vào đây.</a>
              </span>
            </p>
          </div>
        </div>
      </div>

      <Intro />
      <Guidance />
      <Footer />
    </div>
  );
}
