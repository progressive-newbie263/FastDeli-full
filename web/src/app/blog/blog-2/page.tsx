import React from 'react';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Footer from '@/components/Footer';

import SocialMedia from '@/components/SocialMedia';

export default function Blog2() {
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

      <div
        className="flex flex-col text-black py-6 px-8 items-center
        md:flex-row md:py-12 md:px-20 md:justify-between md:items-start"
      >
        <section className="p-8 border border-gray-200 w-[450px] md:w-[800px] sm:w-[600px]">
          <h1 className="text-3xl font-bold mb-4">
            FoodDeli - Giao Đồ Ăn Mọi Lúc, Mọi Nơi
          </h1>

          <p className="mb-4">
            Trong nhịp sống bận rộn, Grab Food mang đến cho bạn sự tiện lợi tuyệt vời khi bạn
            muốn thưởng thức món ăn yêu thích ngay tại nhà hay nơi làm việc.
          </p>

          <div className="relative w-full h-[300px] border border-black my-12">
            <Image
              src="/assets/blog-images/blog-2.jpg"
              alt="blog-shared-img"
              fill
              className="object-fit"
            />
          </div>

          <h3 className="text-xl font-semibold mt-6">1. Đặt Món Ăn Dễ Dàng</h3>
          <p>
            Với Grab Food, bạn có thể tìm thấy hàng ngàn món ăn từ các nhà hàng, quán ăn nổi
            tiếng chỉ với vài thao tác trên điện thoại. Chỉ cần chọn món, điền địa chỉ giao hàng,
            và chờ đợi tài xế Grab giao tận nơi.
          </p>

          <h3 className="text-xl font-semibold mt-6">2. Thực Đơn Đa Dạng</h3>
          <p>
            Không chỉ là các món ăn vặt, Grab Food cung cấp một thực đơn phong phú từ các món ăn
            sáng, ăn trưa, tối, đến các món tráng miệng và đồ uống. Bạn sẽ không bao giờ cảm thấy
            thiếu lựa chọn!
          </p>

          <h3 className="text-xl font-semibold mt-6">3. Ưu Đãi Và Khuyến Mãi Liên Tục</h3>
          <p>
            Grab Food luôn có những chương trình ưu đãi hấp dẫn, giúp bạn tiết kiệm chi phí mỗi
            lần đặt món. Với các mã giảm giá, khuyến mãi, bạn có thể thưởng thức món ăn ngon mà
            không lo về giá.
          </p>

          <h3 className="text-xl font-semibold mt-6">
            4. Giao Hàng Nhanh Chóng và Đảm Bảo Chất Lượng
          </h3>
          <p>
            Grab luôn cam kết giao đồ ăn nhanh chóng, đúng giờ, đảm bảo món ăn vẫn nóng hổi và
            tươi ngon khi bạn nhận được.
          </p>

          <h3 className="text-xl font-semibold mt-6">5. Thanh Toán Linh Hoạt</h3>
          <p>
            Grab Food hỗ trợ nhiều hình thức thanh toán, từ ví điện tử, thẻ tín dụng cho đến
            thanh toán khi nhận hàng, giúp bạn dễ dàng hoàn tất giao dịch mà không gặp bất kỳ khó
            khăn nào.
          </p>

          <p className="mt-6">
            Không cần phải ra ngoài, không cần phải lo lắng về việc tìm kiếm nhà hàng, Grab Food
            sẽ đưa các món ăn bạn yêu thích ngay đến tận tay.
          </p>
        </section>

        <SocialMedia />
      </div>

      <Footer />
    </div>
  );
}
