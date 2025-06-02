import React from 'react';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Footer from '@/components/Footer';

//bộ icon các mạng xã hội
import SocialMedia from '@/components/SocialMedia';



export default function Blog1() {
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
            FastDeli - Giải pháp di chuyển và giao hàng toàn diện cho cuộc sống hiện đại
          </h1>

          <div className="relative w-full h-[300px] border border-black my-12">
            <Image
              src="/assets/blog-images/blog-1.png"
              alt="blog-shared-img"
              fill
              className="object-contain"
            />
          </div>

          <h2 className="text-2xl font-semibold mb-4">Khám Phá FastDeli - Dễ Dàng Đi Đến Mọi Nơi</h2>
          <p>FastDeli là dịch vụ vận chuyển bằng xe máy, giúp bạn di chuyển nhanh chóng và tiện lợi đến mọi nơi trong thành phố. Hãy cùng khám phá lý do vì sao FastDeli lại trở thành sự lựa chọn số một của hàng triệu người dùng mỗi ngày!</p>

          <h3 className="text-xl font-semibold mt-6">1. Đi Lại Nhanh Chóng và Tiết Kiệm Thời Gian</h3>
          <p>FastDeli không chỉ giúp bạn tránh được tắc đường mà còn giúp tiết kiệm thời gian di chuyển. Với đội ngũ tài xế đông đảo, bạn sẽ luôn có thể tìm được một chiếc xe gần nhất, sẵn sàng đưa bạn đến nơi bạn cần đến một cách nhanh chóng.</p>

          <h3 className="text-xl font-semibold mt-6">2. Thích Hợp Với Mọi Loại Di Chuyển</h3>
          <p>Dù bạn đang đi làm, gặp bạn bè, hay đi công tác, FastDeli luôn là một lựa chọn tuyệt vời. Chỉ cần vài cú chạm trên điện thoại, bạn sẽ có ngay một chiếc xe máy đưa bạn đi đến bất kỳ đâu trong thành phố.</p>

          <h3 className="text-xl font-semibold mt-6">3. Lựa Chọn Linh Hoạt</h3>
          <p>Với FastDeli, bạn có thể chọn các loại dịch vụ phù hợp với nhu cầu di chuyển của mình, từ đi một chiều cho đến việc di chuyển trong những giờ cao điểm. Điều này giúp bạn chủ động hơn trong việc lập kế hoạch cho hành trình của mình.</p>

          <h3 className="text-xl font-semibold mt-6">4. Tiện Lợi Với Mức Giá Cạnh Tranh</h3>
          <p>FastDeli không chỉ mang đến sự tiện lợi mà còn có mức giá vô cùng hợp lý. Bạn sẽ không phải lo lắng về chi phí quá cao, vì FastDeli luôn cung cấp mức giá công khai và minh bạch, giúp bạn dễ dàng kiểm soát chi phí mỗi lần sử dụng.</p>

          <h3 className="text-xl font-semibold mt-6">5. An Toàn và Đảm Bảo</h3>
          <p>Tất cả các tài xế FastDeli đều đã qua quy trình kiểm tra và đào tạo kỹ lưỡng, đảm bảo sự an toàn và hài lòng cho hành khách. Hơn nữa, FastDeli luôn cam kết bảo vệ quyền lợi của bạn trong suốt chuyến đi.</p>

          <p className="mt-8">FastDeli không chỉ là một dịch vụ vận chuyển, mà còn là một người bạn đồng hành tin cậy, giúp bạn di chuyển mọi lúc mọi nơi.</p>
       </section>

        {/* liên kết MXH  */}
        <SocialMedia />
      </div>

      <Footer />
    </div>
  );
}
