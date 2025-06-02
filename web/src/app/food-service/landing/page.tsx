'use client';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import PartnerButton from '@/components/PartnerButton';
import Image from 'next/image';
import Intro from '@/components/landing-bike/Intro';
import Guidance from '@/components/landing-bike/Guidance';

// CODE NÀY LÀ LANDING PAGE CỦA FOOD SERVICE. NÓ NHƯ CÁI INTRO ẤY, Đ PHẢI PAGE CHÍNH.
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
          <div className='flex flex-col absolute top-48 left-20 md:left-50'>
            <h2 className="text-white text-5xl font-semibold">FoodDeli</h2>

            <p className='mt-2 text-[18px]'>Thèm món gì, đặt ngay món đó!</p>

            <button
              onClick={() => window.location.href = '/food-service'}
              className="w-48 bg-green-600 py-2 rounded-md text-[16px] hover:bg-green-700 cursor-pointer duration-300 ease-in-out mt-16 mb-4"
            >
              Đặt hàng ngay
            </button>

            <p className='max-w-[350px]'>
              Trở thành Đối tác Nhà hàng của FoodDeli ngay!
              &nbsp;
              <span className='text-blue-300'><a href='#'>Ấn vào đây.</a></span>
            </p>
          </div>
        </div>
      </div>
      
      {/* main section/nd chính */}
      <Intro />

      <Guidance />

      <Footer />
    </div>
  );
}