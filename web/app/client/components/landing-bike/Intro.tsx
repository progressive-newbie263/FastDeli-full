import Image from 'next/image';
import React from 'react'

const Intro = () => {
  return (
    <div className='flex text-center flex-col text-[18px]'>
      <p className='text-green-500 text-[40px] font-semibold mt-20 mb-10'>
        Mang đến cho bạn món ăn ưa thích, nóng hổi và ngon lành
      </p>

      <div className='max-w-3/5 text-center mx-auto'>
        <p className='mb-16'>
          Đặt đồ ăn giao hàng tận nhà nhanh chóng lấp đầy chiếc bụng đói của bạn với những món ngon yêu thích và dịch vụ giao hàng “thần tốc”. 
          GrabFood hiện đang có mặt tại nhiều tỉnh thành ở Việt Nam: Thành phố Hồ Chí Minh, Hà Nội, Đà Nẵng, Vũng Tàu, Bình Dương, Đồng Nai, Cần Thơ, Đà Lạt,…. 
          Chúng tôi đang dần mở rộng thêm nhiều khu vực trong thời gian tới!
        </p>

        {/* khung intro (text cứng) */}
        <div className='flex flex-col lg:flex-row mb-20'>
          <div>
            <Image
              src="/assets/food-images/intro-1.png"
              alt="Ảnh"
              width={200}
              height={200}
              className="mx-auto mb-4"
            />

            <div className='max-w-[450px] px-6'>
              <p className='text-green-500 text-2xl font-semibold mb-4'>Đặt đồ ăn online chỉ sau vài cú chạm.</p>
              
              <p>FastDeli giao hàng nhanh thần tốc, đảm bảo mang cho bạn bữa ăn nóng hổi và ngon lành, dù bạn đang ở đâu.</p>
            </div>
          </div>
          
          <div>
            <Image
              src="/assets/food-images/intro-2.png"
              alt="Ảnh"
              width={200}
              height={200}
              className="mx-auto mb-4"
            />

            <div className='max-w-[450px] px-6'>
              <p className='text-green-500 text-2xl font-semibold mb-4'>Đa dạng lựa chọn.</p>
              
              <p>Danh sách đa dạng các món ăn của chúng tôi có thể phục vụ cho mọi nhu cầu ăn uống của bạn.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intro;