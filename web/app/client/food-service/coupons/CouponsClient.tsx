'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Tag } from 'lucide-react';
import dayjs from 'dayjs';

interface Coupon {
  id: number;
  code: string;
  title: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount' | string;
  discount_value: number;
  start_date: string;
  end_date: string;
  image_url?: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // ví dụ 2 địa điểm (test)
  // const markers = [
  //   { id: 1, lat: 21.028511, lng: 105.804817, title: 'Quán A' },
  //   { id: 2, lat: 21.030000, lng: 105.803000, title: 'Quán B' }, //Số 31, Đường Cầu Giấy, Ngọc Khánh, Ba Đình, Hà Nội, Hà Nội, 11109
  // ];

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/coupons');
        const data = await res.json();

        if (data?.success && Array.isArray(data?.data?.coupons)) {
          setCoupons(data.data.coupons);
        } else {
          console.error('Lỗi khi lấy dữ liệu coupon:', data);
        }
      } catch (err) {
        console.error('Lỗi fetch coupon:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-600">
        <Loader2 className="animate-spin text-3xl" />
      </div>
    );
  }

  return (
    <>
    <div className="container mx-auto px-16 md:px-20 py-8 mt-20">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800 flex items-center gap-3">
        <Tag className="text-orange-500" /> Mã Khuyến Mãi
      </h1>

      {coupons.length === 0 ? (
        <p className="text-gray-500 text-center text-lg">
          Hiện không có khuyến mãi nào.
        </p>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:w-[750px] mx-auto pb-16">
          {coupons.map((coupon) => {
            const isExpired = dayjs().isAfter(dayjs(coupon.end_date));

            return (
              
                <div
                  key={coupon.id}
                  className={`
                    flex flex-col md:flex-row rounded-2xl p-5 shadow-md hover:shadow-xl 
                    transition-all hover:-translate-y-1 gap-4 cursor-pointer duration-150 
                    ${isExpired ? 'bg-gray-100 text-gray-400' : 'bg-white'}
                  `}
                >
                  {/* Hình ảnh */}
                  <div className="w-full md:w-36 h-36 rounded-xl overflow-hidden flex-shrink-0 mx-auto md:mx-0">
                    <img
                      src={coupon.image_url || '/assets/foods/default-food.jpg'}
                      alt={coupon.title}
                      className="w-full h-full object-cover object-center scale-75 md:scale-110"
                    />
                  </div>

                  {/* Nội dung */}
                  <div className="flex-1 text-left">
                    <div className="flex flex-col-reverse justify-between items-start md:items-center md:flex-row">
                      <h3 className="text-lg md:text-xl font-bold tracking-wide md:w-[70%]">
                        {coupon.title}
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

                    <p className="text-gray-600 mt-2 md:w-[70%]">{coupon.description}</p>

                    <p className="text-orange-600 font-bold text-lg mt-3">
                      [{coupon.code}] {' '}
                      Giảm {Number(coupon.discount_value)}
                      {coupon.discount_type === 'percentage' ? '%' : ' VNĐ'}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Hết hạn: {dayjs(coupon.end_date).format('DD/MM/YYYY HH:mm')}
                    </p>
                  </div>
                </div>
            );
          })}
        </div>
      )}
    </div>

    {/* test */}
    {/* <MapClient center={[21.028511, 105.804817]} zoom={15} markers={markers} /> */}
    </>
  );
}