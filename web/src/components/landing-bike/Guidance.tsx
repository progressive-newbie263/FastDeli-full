'use client';

import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

type Question = {
  question: string;
  answer: string;
};

const questions: Question[] = [
  {
    question: 'GrabFood là gì?',
    answer: 'GrabFood là dịch vụ giao đồ ăn nhanh chóng, tiện lợi, giúp bạn đặt món ăn yêu thích từ nhiều nhà hàng chỉ bằng vài cú chạm.'
  },
  {
    question: 'GrabFood hoạt động trong khung giờ nào?',
    answer: 'GrabFood hoạt động từ 6:00 sáng đến 11:00 tối mỗi ngày. Một số nhà hàng có thể có thời gian phục vụ riêng.'
  },
  {
    question: 'Những nhà hàng, quán ăn nào trong khu vực của tôi giao hàng qua GrabFood?',
    answer: 'Dựa vào vị trí của bạn, hệ thống sẽ tự động gợi ý những nhà hàng gần nhất có hỗ trợ giao hàng.'
  },
  {
    question: 'Tôi có thể thanh toán bằng tiền mặt không?',
    answer: 'Có. Bạn có thể chọn thanh toán bằng tiền mặt hoặc ví điện tử khi đặt hàng.'
  }, 
  {
    question:'Chi phí giao đồ ăn được tính như thế nào?',
    answer: 'Chi phí giao đồ ăn được tính dựa trên khoảng cách ở nhà hàng bạn đặt và địa chỉ nhà của bạn.'
  }
];

const Guidance = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className='text-center flex flex-col text-[18px] bg-gray-50'>
      <p className='text-green-500 text-[40px] font-semibold mt-20 mb-10'>FAQs</p>

      <div className='max-w-[750px] mx-auto flex flex-col gap-4 mb-20 px-6'>
        {questions.map((item, index: number) => (
          <div
            key={index}
            className='border border-gray-300 rounded-lg text-left cursor-pointer shadow-sm transition-all'
            onClick={() => toggle(index)}
          >
            <div className='flex justify-between items-center px-6 py-3 md:px-12 md:py-6'>
              <p className='font-medium'>{item.question}</p>

              <FiChevronDown className={`transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
            </div>

            {openIndex === index && (
              <div className='px-6 pb-4 text-gray-600'>
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Guidance;
