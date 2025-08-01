import { FC } from 'react';
import Navbar from '@client/components/Navbar';
import Footer from '@client/components/Footer';
import HomePage from '@client/components/HomePage';
import Services from '@client/components/Services';
import Blog from '@client/components/Blog';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "FastDeli - Vận chuyển hoả tốc",
  description:
    "Đi lại, ăn uống, vận chuyển hàng hoá một cách nhanh chóng ... chúng tôi sẽ cung cấp tất cả cho bạn",
};

// Define the Home component as a Functional Component (FC)
const Home: FC = () => {

  return (
    <div className="font-inter min-h-screen">
      <Navbar />
      
      <HomePage />
      
      <Services />
      
      <div className="p-8 bg-white text-black">
        <h1 className="text-3xl font-bold mb-8">Bài viết nổi bật tuần này</h1>
        
        {/* section chứa các blog*/}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Blog
            image="/assets/blog-images/blog-1.png" 
            title="FastDeli - Giải pháp di chuyển và giao hàng toàn diện cho cuộc sống hiện đại"
            description="FastDeli là dịch vụ vận chuyển bằng xe máy, giúp bạn di chuyển nhanh chóng và tiện lợi đến mọi nơi trong thành phố. Hãy cùng khám phá lý do vì sao FastDeli lại trở thành sự lựa chọn số một của hàng triệu người dùng mỗi ngày!"
            href="/client/blog/blog-1"
          />
          
          <Blog
            image="/assets/blog-images/blog-2.jpg" 
            title="FoodDeli - Giao Đồ Ăn Mọi Lúc, Mọi Nơi"
            description="Trong nhịp sống bận rộn, Grab Food mang đến cho bạn sự tiện lợi tuyệt vời khi bạn muốn thưởng thức món ăn yêu thích ngay tại nhà hay nơi làm việc."
            href="/client/blog/blog-2"
          />
          
          <Blog
            image="/assets/blog-images/blog-3.jpg" 
            title="ShipDeli - Gửi Hàng Nhanh Chóng Và An Toàn"
            description="Với ShipDeli, bạn có thể gửi hàng đến bất kỳ đâu trong thành phố chỉ trong một khoảng thời gian ngắn. Dù là tài liệu quan trọng, món quà sinh nhật, hay đồ dùng cá nhân, ShipDeli sẽ giúp bạn gửi đi một cách nhanh chóng và an toàn."
            href="/client/blog/blog-3"
          />

          <Blog
            image="/assets/blog-images/blog-4.jpg" 
            title="FastDeli - Khách hàng là thượng đế"
            description="Một trong những lý do khiến FastDeli trở thành ứng dụng được yêu thích chính là sự chăm sóc khách hàng tận tâm và chuyên nghiệp."
            href="/client/blog/blog-4"
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Home;