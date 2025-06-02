import React from 'react';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Footer from '@/components/Footer';

import SocialMedia from '@/components/SocialMedia';

export default function Blog4() {
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
            FastDeli - Khách hàng là thượng đế
          </h1>

          <div className="relative w-full h-[300px] border border-black my-12">
            <Image
              src="/assets/blog-images/blog-4.jpg"
              alt="blog-customer-care-img"
              fill
              className="object-fit"
            />
          </div>

          <p className="mb-6">
            Một trong những lý do khiến FastDeli trở thành ứng dụng được yêu thích chính là sự chăm sóc khách hàng tận tâm và chuyên nghiệp.
          </p>

          <h3 className="text-xl font-semibold mt-6">1. Hỗ Trợ Nhanh Chóng Và Hiệu Quả</h3>
          <p>
            Khi gặp sự cố với dịch vụ, đội ngũ hỗ trợ FastDeli luôn sẵn sàng giải đáp và giúp đỡ. 
            Dù là vấn đề về thanh toán, đơn hàng hay thắc mắc khác, chúng tôi đảm bảo xử lý nhanh chóng và hiệu quả.
          </p>

          <h3 className="text-xl font-semibold mt-6">2. Phản Hồi Từ Người Dùng</h3>
          <p>
            FastDeli luôn lắng nghe và ghi nhận phản hồi từ khách hàng để không ngừng cải thiện dịch vụ. 
            Mỗi ý kiến đóng góp đều giúp chúng tôi hoàn thiện hơn từng ngày.
          </p>

          <h3 className="text-xl font-semibold mt-6">3. Chương Trình Khách Hàng Thân Thiết</h3>
          <p>
            Không chỉ cung cấp dịch vụ chất lượng, FastDeli còn mang đến các chương trình tích điểm và ưu đãi hấp dẫn dành cho khách hàng thân thiết.
          </p>

          <h3 className="text-xl font-semibold mt-6">4. Đảm Bảo Sự An Toàn Cho Người Dùng</h3>
          <p>
            FastDeli đặt yếu tố an toàn lên hàng đầu. 
            Các tài xế đều trải qua quy trình kiểm tra nghiêm ngặt và được đào tạo bài bản. 
            Chúng tôi cũng cung cấp nhiều tính năng bảo mật nhằm đảm bảo trải nghiệm sử dụng luôn an toàn và tin cậy.
          </p>

          <p className="mt-8">
            FastDeli không chỉ là ứng dụng giao hàng tiện lợi mà còn là người bạn đồng hành đáng tin cậy trong mọi hành trình của bạn.
          </p>
        </section>

        {/* liên kết MXH */}
        <SocialMedia />
      </div>

      <Footer />
    </div>
  );
}
