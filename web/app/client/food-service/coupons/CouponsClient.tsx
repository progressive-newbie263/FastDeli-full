'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bookmark, BookmarkCheck, Loader2, Search } from 'lucide-react';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

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
  is_platform?: boolean;
  restaurant_id?: number | null;
  restaurant_name?: string | null;
}

type SourceFilter = 'all' | 'system' | 'restaurant';
const SAVED_COUPONS_KEY = 'fooddeli_saved_coupons';

const toVnd = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const hasRestaurantSource = (coupon: Coupon) => Number(coupon.restaurant_id || 0) > 0;

const isRestaurantCoupon = (coupon: Coupon) => hasRestaurantSource(coupon);

const isSystemCoupon = (coupon: Coupon) => !hasRestaurantSource(coupon);

const getDiscountLabel = (coupon: Coupon) => {
  if (coupon.discount_type === 'percentage') {
    return `Giảm ${Number(coupon.discount_value)}%`;
  }
  return `Giảm ${toVnd(coupon.discount_value)}`;
};

const getSubtitle = (coupon: Coupon) => {
  if (isRestaurantCoupon(coupon)) {
    return coupon.restaurant_name || `Nhà hàng #${coupon.restaurant_id}`;
  }
  return 'Áp dụng toàn hệ thống FoodDeli';
};

export default function CouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('system');
  const [searchText, setSearchText] = useState('');
  const [savedCouponIds, setSavedCouponIds] = useState<number[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_COUPONS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSavedCouponIds(parsed.map((id) => Number(id)).filter((id) => Number.isFinite(id)));
      }
    } catch (error) {
      console.error('Không thể đọc danh sách mã đã lưu:', error);
    }
  }, []);

  const persistSavedCoupons = (ids: number[]) => {
    setSavedCouponIds(ids);
    localStorage.setItem(SAVED_COUPONS_KEY, JSON.stringify(ids));
  };

  const toggleSaveCoupon = (couponId: number) => {
    if (savedCouponIds.includes(couponId)) {
      persistSavedCoupons(savedCouponIds.filter((id) => id !== couponId));
      return;
    }
    persistSavedCoupons([...savedCouponIds, couponId]);
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(null), 1500);
    } catch (error) {
      console.error('Không thể copy mã:', error);
    }
  };

  const couponStats = useMemo(() => {
    const system = coupons.filter((coupon) => isSystemCoupon(coupon)).length;
    const restaurant = coupons.filter((coupon) => isRestaurantCoupon(coupon)).length;
    return { total: coupons.length, system, restaurant };
  }, [coupons]);

  const displayedCoupons = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return coupons.filter((coupon) => {
      const matchesSource =
        sourceFilter === 'all'
          ? true
          : sourceFilter === 'system'
            ? isSystemCoupon(coupon)
            : isRestaurantCoupon(coupon);

      if (!matchesSource) return false;
      if (!normalizedSearch) return true;

      const haystack = [
        coupon.code,
        coupon.title,
        coupon.description,
        coupon.restaurant_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [coupons, sourceFilter, searchText]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 text-gray-600 mt-16">
        <Loader2 className="animate-spin text-3xl" />
      </div>
    );
  }

  return (
    <main className="font-inter min-h-screen bg-[#f3f7f5] pt-16 pb-10">
      <section className="relative text-white px-4 sm:px-6 lg:px-8 pt-6 pb-12 overflow-hidden">

        {/* Gradient (LOWEST) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f8b4c]/80 to-[#30a86a]/80 z-0" />

        {/* 
          Promotion (ảnh background) 
            - sm:w-[250px] sm:top-1/4
            - md:w-[300px] md:top-1/3 
            - lg:w-[375px]
        */}
        <div
          className="
            absolute right-10 -translate-y-1/2 
            sm:w-[400px] sm:top-2/5
            w-[300px] top-1/3
            h-full bg-no-repeat bg-contain bg-right opacity-40 z-[1]"
          style={{
            backgroundImage:
              "url('https://res.cloudinary.com/dpldznnma/image/upload/v1774510903/khuyen-mai-background.png')",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>

          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Kho mã khuyến mãi
              </h1>
              <p className="text-sm sm:text-base text-white/90 mt-1">
                Lưu mã trước, dùng nhanh khi đặt món.
              </p>
            </div>

            {/* <TicketPercent className="w-8 h-8 text-white/95 hidden sm:block" /> */}
          </div>

          {/*
            note: cân nhắc ẩn đi "all"
          */}
          <div className="flex mt-4 rounded-2xl bg-white/18 p-1.5 gap-1 w-fit">
            {[
              { key: 'system', label: `Từ FoodDeli (${couponStats.system})` },
              { key: 'restaurant', label: `Từ nhà hàng (${couponStats.restaurant})` },
              { key: 'all', label: `Tất cả (${couponStats.total})` },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSourceFilter(tab.key as SourceFilter)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors 
                  ${sourceFilter === tab.key ? 'bg-white text-[#0f8b4c]' : 'text-white/95 hover:bg-white/15'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-white/90 mt-2">Lưu chỉ có hiệu lực trên thiết bị hiện tại.</p>
        </div>
      </section>

      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 z-20">
        <div className="rounded-2xl border border-[#d8e5de] bg-white shadow-sm p-3 sm:p-4 flex items-center gap-3">
          <Search className="text-[#7a9187] w-5 h-5" />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Tìm theo mã, tên ưu đãi hoặc nhà hàng"
            className="w-full outline-none text-[15px] text-[#1c2a23] placeholder:text-[#93a59c]"
          />
        </div>

        <div className="mt-5 space-y-3 pb-12">
          {displayedCoupons.length === 0 ? (
            <div className="rounded-2xl border border-[#d9e7df] bg-white p-8 text-center text-[#6f857b]">
              Chưa có coupon phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            displayedCoupons.map((coupon) => {
              const isRestaurantCouponItem = isRestaurantCoupon(coupon);
              const isSaved = savedCouponIds.includes(coupon.id);

              const navigateToRestaurant = () => {
                if (!isRestaurantCouponItem || !coupon.restaurant_id) return;
                router.push(`/client/food-service/restaurants/${coupon.restaurant_id}`);
              };

              const navigateToRestaurantList = () => {
                router.push('/client/food-service/restaurants');
              };

              return (
                <article
                  key={coupon.id}
                  onClick={isRestaurantCouponItem ? navigateToRestaurant : navigateToRestaurantList}
                  className={`rounded-2xl border bg-white overflow-hidden transition-all ${
                    isRestaurantCouponItem
                      ? 'border-[#d5e8dc] hover:border-[#7fc99a] hover:shadow-md cursor-pointer'
                      : 'border-[#e2ebe6] hover:border-[#61a8e7] hover:shadow-md cursor-pointer'
                  }`}
                >
                  <div className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                    <img
                      src={coupon.image_url || '/assets/foods/default-food.jpg'}
                      alt={coupon.title || coupon.code}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#d8e6df]"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-[#17231d] leading-tight line-clamp-2">
                        {coupon.title || getDiscountLabel(coupon)}
                      </p>
                      <p className="text-sm text-[#70867c] mt-1 line-clamp-1">{getSubtitle(coupon)}</p>
                      <p className="text-[15px] font-semibold text-[#197a43] mt-1">{getDiscountLabel(coupon)}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleSaveCoupon(coupon.id);
                        }}
                        className={`rounded-full px-4 py-1.5 text-sm font-bold inline-flex items-center gap-1.5 ${
                          isSaved
                            ? 'bg-[#0f8b4c] text-white'
                            : 'bg-[#e9f6ee] text-[#0f8b4c] hover:bg-[#d9f0e2]'
                        }`}
                      >
                        {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />} {isSaved ? 'Đã lưu' : 'Lưu mã'}
                      </button>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          copyCode(coupon.code);
                        }}
                        className="text-xs font-semibold text-[#1f7f49] hover:text-[#0f8b4c]"
                      >
                        {copiedCode === coupon.code ? 'Đã sao chép' : `Nhấn để lấy mã: ${coupon.code}`}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}