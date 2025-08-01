import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Services = () => {
  return (
    <section id="services" className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl text-black font-bold text-center mb-12">
          Dịch vụ cung cấp
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Service 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition cursor-pointer hover:scale-105">
            <Image
              src="/icon/services/bike-icon.png"
              alt="Đặt xe"
              width={100}
              height={100}
              className="mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2 text-black">Đặt xe</h3>
            <p className="text-gray-600">
              Đặt được một chuyến xe đến địa điểm bạn cần trong vài phút.
            </p>
          </div>

          {/* Service 2 */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition cursor-pointer hover:scale-105">
            <Link href="/client/food-service/landing">
              <Image
                src="/icon/services/food-icon.svg"
                alt="Đồ ăn"
                width={100}
                height={100}
                className="mx-auto mb-4"
              />

              <h3 className="text-xl font-semibold mb-2 text-black">Đồ ăn</h3>
              
              <p className="text-gray-600">
                Hãy lựa chọn những món ăn yêu thích của bạn từ những quán ăn hàng đầu.
              </p>
            </Link>
          </div>

          {/* Service 3 */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition cursor-pointer hover:scale-105">
            <Image
              src="/icon/services/ship-icon.svg"
              alt="Giao hàng"
              width={100}
              height={100}
              className="mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2 text-black">Giao hàng</h3>
            <p className="text-gray-600">
              Nhận hoặc gửi đi hàng hoá một cách nhanh chóng, an toàn.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
