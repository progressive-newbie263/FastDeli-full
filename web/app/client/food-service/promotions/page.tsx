'use client';

import React, { useEffect, useState } from 'react';
import { FaSpinner, FaTag } from 'react-icons/fa';
import dayjs from 'dayjs';

interface Promotion {
  id: number;
  code: string;
  description: string;
  discount_type: string;
  discount_value: number;
  expires_at: string;
  is_active: boolean;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/promotions');
        const data = await res.json();

        // nest thêm 1 lần nữa 
        // do trong api, bên trong data thay vì có thẳng mảng dữ liệu thì 
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
    <div className="container mx-auto px-4 md:px-16 py-6 mt-20">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800 flex items-center gap-3">
        <FaTag className="text-orange-500" /> Mã Khuyến Mãi
      </h1>

      {promotions.length === 0 ? (
        <p className="text-gray-500 text-center text-lg">
          Hiện không có khuyến mãi nào.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {promotions.map((promo) => {
            const isExpired = dayjs().isAfter(dayjs(promo.expires_at));
            return (
              <div
                key={promo.id}
                className={`rounded-2xl p-5 shadow-md hover:shadow-xl transition-all hover:-translate-y-1
                ${isExpired ? 'bg-gray-100 text-gray-400' : 'bg-white'}`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold tracking-wide">
                    {promo.code}
                  </h3>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      isExpired
                        ? 'bg-gray-200 text-gray-500'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {isExpired ? 'Hết hạn' : 'Còn hiệu lực'}
                  </span>
                </div>

                <p className="text-gray-600 mt-2">{promo.description}</p>

                <p className="text-orange-600 font-bold text-lg mt-3">
                  Giảm {Number(promo.discount_value)} {promo.discount_type === 'percent' ? '%' : 'VNĐ'}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Hết hạn: {dayjs(promo.expires_at).format('DD/MM/YYYY HH:mm')}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
