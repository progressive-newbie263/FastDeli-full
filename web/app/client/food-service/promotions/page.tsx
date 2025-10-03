'use client';

import React, { useEffect, useState } from 'react';
import { FaSpinner, FaTag } from 'react-icons/fa';
import dayjs from 'dayjs';

interface Promotion {
  id: number;
  title: string;
  description: string;
  discount_type: string;
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  image_url: string;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/promotions');
        const data = await res.json();

        if (data?.success && Array.isArray(data.data.promotions)) {
          setPromotions(data.data.promotions);
        } else {
          console.error('Lỗi khi lấy dữ liệu khuyến mãi:', data);
        }
      } catch (err) {
        console.error('Lỗi fetch khuyến mãi:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-600">
        <FaSpinner className="animate-spin text-3xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-16 md:px-20 py-8 mt-20">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800 flex items-center gap-3">
        <FaTag className="text-orange-500" /> Mã Khuyến Mãi
      </h1>

      {promotions.length === 0 ? (
        <p className="text-gray-500 text-center text-lg">
          Hiện không có khuyến mãi nào.
        </p>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:w-[750px] mx-auto pb-16">
          {promotions.map((promo) => {
            const isExpired = dayjs().isAfter(dayjs(promo.end_date));

            return (
              <div
                key={promo.id}
                className={`flex flex-col md:flex-row rounded-2xl p-5 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 gap-4
                ${isExpired ? 'bg-gray-100 text-gray-400' : 'bg-white'}`}
              >
                {/* Hình ảnh */}
                <div className="w-full md:w-36 h-36 rounded-xl overflow-hidden flex-shrink-0 mx-auto md:mx-0">
                  <img
                    src={promo.image_url}
                    alt={promo.title}
                    className="w-full h-full object-cover object-center md:scale-150"
                  />
                </div>

                {/* Nội dung */}
                <div className="flex-1 text-left">
                  <div className="flex flex-col-reverse justify-between items-start md:items-center md:flex-row">
                    <h3 className="text-lg md:text-xl font-bold tracking-wide md:w-[70%]">
                      {promo.title}
                    </h3>

                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold mt-2 md:mt-0 ${
                        isExpired
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {isExpired ? 'Hết hạn' : 'Còn hiệu lực'}
                    </span>
                  </div>

                  <p className="text-gray-600 mt-2 md:w-[70%]">{promo.description}</p>

                  <p className="text-orange-600 font-bold text-lg mt-3">
                    Giảm {Number(promo.discount_value)}
                    {promo.discount_type === 'percent' ? '%' : ' VNĐ'}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Hết hạn: {dayjs(promo.end_date).format('DD/MM/YYYY HH:mm')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
