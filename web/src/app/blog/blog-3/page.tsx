import React from 'react';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Footer from '@/components/Footer';

import SocialMedia from '@/components/SocialMedia';

export default function Blog3() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <div className="relative w-full h-[225px]">
        <Image
          src="/assets/blog-images/blog-shared-image.jpg"
          alt="blog-shared-img"
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 flex items-center bg-black/40">
          <h2 className="text-white text-5xl pl-24 pt-8 font-semibold">Bản tin FastDeli</h2>
        </div>
      </div>

      <div className='flex flex-col text-black py-6 px-8 items-center
        md:flex-row md:py-12 md:px-20 md:justify-between md:items-start
      '>
        {/* bài blog */}
        <section className="p-8 border border-gray-200 w-[450px] md:w-[800px] sm:w-[600px]">
          <h1 className="text-3xl font-bold mb-4">
            ShipDeli - Gửi Hàng Nhanh Chóng Và An Toàn
          </h1>

          <div className="relative w-full h-[300px] border border-black my-12">
            <Image
              src="/assets/blog-images/blog-3.jpg"
              alt="blog-express-img"
              fill
              className="object-fit"
            />
          </div>

          <p className="mb-6">
            ShipDeli mang đến giải pháp gửi hàng nhanh chóng, tiết kiệm và an toàn, phục vụ cho nhu cầu giao hàng trong ngày của bạn.
          </p>

          <h3 className="text-xl font-semibold mt-6">1. Dịch Vụ Giao Hàng Nhanh Chóng</h3>
          <p>
            Với ShipDeli, bạn có thể gửi hàng đến bất kỳ đâu trong thành phố chỉ trong một khoảng thời gian ngắn. 
            Dù là tài liệu quan trọng, món quà sinh nhật, hay đồ dùng cá nhân, ShipDeli sẽ giúp bạn gửi đi một cách nhanh chóng và an toàn.
          </p>

          <h3 className="text-xl font-semibold mt-6">2. Lựa Chọn Phù Hợp Với Mọi Nhu Cầu</h3>
          <p>
            ShipDeli cung cấp nhiều hình thức vận chuyển linh hoạt, từ xe máy đến xe hơi, giúp bạn lựa chọn phương tiện phù hợp với nhu cầu gửi hàng. 
            Tùy vào kích thước và trọng lượng của hàng hóa, bạn có thể chọn dịch vụ phù hợp nhất.
          </p>

          <h3 className="text-xl font-semibold mt-6">3. Giá Cả Hợp Lý</h3>
          <p>
            ShipDeli mang lại dịch vụ giao hàng với mức giá rất cạnh tranh. 
            Bạn sẽ không phải lo lắng về phí dịch vụ cao, vì chúng tôi luôn cung cấp mức giá rõ ràng và minh bạch.
          </p>

          <h3 className="text-xl font-semibold mt-6">4. Bảo Mật và An Toàn</h3>
          <p>
            Chúng tôi cam kết bảo mật và đảm bảo an toàn cho tất cả các gói hàng. 
            Tài xế ShipDeli đều được đào tạo kỹ lưỡng và đã qua kiểm tra, đảm bảo giao nhận hàng hóa luôn suôn sẻ.
          </p>

          <h3 className="text-xl font-semibold mt-6">5. Theo Dõi Và Quản Lý Dễ Dàng</h3>
          <p>
            ShipDeli hỗ trợ theo dõi đơn hàng thời gian thực. Bạn có thể kiểm tra trạng thái và biết được thời gian dự kiến giao hàng một cách dễ dàng.
          </p>

          <p className="mt-8">
            ShipDeli là lựa chọn lý tưởng cho những ai cần giao hàng nhanh, an toàn và tiện lợi mà không mất quá nhiều thời gian.
          </p>
        </section>

        {/* liên kết MXH */}
        <SocialMedia />
      </div>

      <Footer />
    </div>
  );
}
