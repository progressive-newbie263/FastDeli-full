'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';

const images = [
  '/assets/ship-1.jpg',  
  '/assets/ship-2.jpg',
  '/assets/food-2.jpg',
  '/assets/trans-1.jpg',
  '/assets/trans-2.webp',
];

const HomePage = () => {
  // State để kiểm soát hiệu úng fading của ảnh
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false); 

  useEffect(() => {
    const timer = setInterval(() => {
      handleNextImage();
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  //function này áp dụng hiệu ứng fading cho cả việc ảnh tự chuyển + ảnh chuyển động./
  const handleNextImage = () => {
    setIsFading(true);

    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      setIsFading(false);
    }, 250);
  };

  // Nếu chọn ảnh thủ công, cũng fade-out trước rồi đổi
  const handleSelectImage = (index: number) => {
    setIsFading(true);

    setTimeout(() => {
      setCurrentIndex(index);
      setIsFading(false);
    }, 250);
  };

  return (
    <section className="bg-gradient-to-r from-green-500 to-cyan-400 text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-2 justify-between flex flex-col items-center lg:flex-row sm:px-3 lg:px-4">
        {/* Intro (trái) */}
        <div className="md:w-1/2 max-w-[433px]">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Nhanh, rẻ và tiện lợi - Lựa chọn hàng đầu cho quý khách
          </h1>

          <p className="text-lg mb-12">
            Ăn uống, vận chuyển, đi lại. Chúng tôi cung cấp mọi dịch vụ cho quý khách
          </p>

          <div className="flex space-x-4">
            <button className="bg-white text-green-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 cursor-pointer transition duration-300 ease-in-out">
              Bắt đầu
            </button>

            <button className="border border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-green-600 cursor-pointer transition duration-300 ease-in-out">
              Tìm hiểu thêm
            </button>
          </div>
        </div>

        {/* Ảnh (Phải) */}
        <div className="md:w-1/2 mt-8 lg:mt-0 flex flex-col items-center md:mt-12">
          <div className="relative w-[450px] h-[300px] rounded-lg shadow-lg overflow-hidden lg:w-[600px] lg:h-[400px]">
            <Image
              src={images[currentIndex]}
              alt="App Preview"
              fill
              className={`object-cover transition-opacity duration-350 ease-in-out ${
                isFading ? 'opacity-0' : 'opacity-100'
              }`}
            />
          </div>

          {/* Các nút chọn hình */}
          <div className="flex space-x-2 mt-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleSelectImage(index)}
                className={`w-3 h-3 rounded-full cursor-pointer transition delay-250 duration-350 ease-in-out 
                  ${index === currentIndex ? 'bg-white' : 'bg-gray-300'}
                `}
              >

              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
