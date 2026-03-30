"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  CreditCard,
  Wallet,
  Phone,
  User,
  Pencil,
  ChevronLeft,
  ShoppingBag,
  Utensils,
  Building2,
  Check,
  Tag,
  Gift,
  X,
} from "lucide-react";
import { RestaurantGroup, CartItem, FullCart } from "../utils/cartHandler";
import { Food } from "../interfaces";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

// Bank interface
interface Bank {
  id: string;
  name: string;
  fullName: string;
  bin: string;
  logo: string;
}

interface CouponItem {
  id: number;
  code: string;
  title?: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_order_value: number;
  max_discount?: number | null;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
}

const getCouponInvalidReason = (coupon: CouponItem, orderTotal: number): string | null => {
  if (coupon.is_active === false) {
    return 'Mã giảm giá đã tắt';
  }

  const minOrder = Number(coupon.min_order_value || 0);
  if (orderTotal < minOrder) {
    return `Đơn chưa đủ ${minOrder.toLocaleString('vi-VN')}đ`;
  }

  if (coupon.start_date) {
    const startDate = new Date(coupon.start_date);
    if (!Number.isNaN(startDate.getTime()) && new Date() < startDate) {
      return 'Mã giảm giá chưa đến thời gian áp dụng';
    }
  }

  if (coupon.end_date) {
    const endDate = new Date(coupon.end_date);
    if (!Number.isNaN(endDate.getTime()) && new Date() > endDate) {
      return 'Mã giảm giá đã hết hạn';
    }
  }

  return null;
};

const parseToNumber = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const estimateDistanceKm = (
  userLat?: number,
  userLng?: number,
  restaurantLat?: number,
  restaurantLng?: number
): number | null => {
  if (
    userLat === undefined ||
    userLng === undefined ||
    restaurantLat === undefined ||
    restaurantLng === undefined
  ) {
    return null;
  }

  const dx = restaurantLat - userLat;
  const dy = restaurantLng - userLng;
  return Math.sqrt(dx * dx + dy * dy) * 111;
};

const calculateDeliveryFeeByDistance = (distanceKm: number, baseFee: number) => {
  const safeBase = Number.isFinite(baseFee) && baseFee > 0 ? baseFee : 15000;
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    return safeBase;
  }

  if (distanceKm <= 2) {
    return safeBase;
  }

  const extraKm = Math.ceil(distanceKm - 2);
  return safeBase + extraKm * 3500;
};

const formatCouponBenefit = (coupon: CouponItem) => {
  if (coupon.discount_type === 'percentage') {
    const maxPart = coupon.max_discount ? ` (tối đa ${Number(coupon.max_discount).toLocaleString('vi-VN')}đ)` : '';
    return `Giảm ${Number(coupon.discount_value).toLocaleString('vi-VN')}%${maxPart}`;
  }

  return `Giảm ${Number(coupon.discount_value).toLocaleString('vi-VN')}đ`;
};

// Danh sách ngân hàng VietQR
const BANKS: Bank[] = [
  { id: 'VCB', name: 'Vietcombank', fullName: 'Ngân hàng TMCP Ngoại Thương Việt Nam', bin: '970436', logo: '🏦' },
  { id: 'TCB', name: 'Techcombank', fullName: 'Ngân hàng TMCP Kỹ Thương Việt Nam', bin: '970407', logo: '🏦' },
  { id: 'BIDV', name: 'BIDV', fullName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', bin: '970418', logo: '🏦' },
  { id: 'MB', name: 'MB Bank', fullName: 'Ngân hàng TMCP Quân Đội', bin: '970422', logo: '🏦' },
  { id: 'ACB', name: 'ACB', fullName: 'Ngân hàng TMCP Á Châu', bin: '970416', logo: '🏦' },
  { id: 'VPB', name: 'VPBank', fullName: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', bin: '970432', logo: '🏦' },
];

const CheckoutClient = () => {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [showBankSelector, setShowBankSelector] = useState(false);
  
  const [couponCode, setCouponCode] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState<CouponItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponItem | null>(null);
  const [validatedDiscount, setValidatedDiscount] = useState(0);
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [showCouponList, setShowCouponList] = useState(false);
  
  const [userInfos, setUserInfos] = useState({
    id: "",
    name: "",
    phone: "",
    note: "",
  });
  const [userLocation, setUserLocation] = useState({
    location: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });
  const [cartData, setCartData] = useState<RestaurantGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = useSearchParams();
  const selectedRestaurantId = searchParams.get("restaurantId");
  const router = useRouter();

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (!savedCart) {
          setIsLoading(false);
          return;
        }

        const parsedCart: FullCart = JSON.parse(savedCart);
        const restaurantIds = Object.keys(parsedCart);
        const groups: RestaurantGroup[] = [];

        for (const restaurantId of restaurantIds) {
          const [resFoods, resInfo] = await Promise.all([
            fetch(`http://localhost:5001/api/restaurants/${restaurantId}/foods`).then((res) => res.json()),
            fetch(`http://localhost:5001/api/restaurants/${restaurantId}`).then((res) => res.json()),
          ]);

          if (!resFoods.success || !resInfo.success) continue;

          const foods: Food[] = Array.isArray(resFoods?.data) ? (resFoods.data as Food[]) : [];
          const restaurantName = resInfo.data.name;
          const restaurantImage = resInfo.data.image_url || "https://via.placeholder.com/64";
          const restaurantLatitude = parseToNumber(resInfo?.data?.latitude);
          const restaurantLongitude = parseToNumber(resInfo?.data?.longitude);
          const restaurantDeliveryFee = parseToNumber(resInfo?.data?.delivery_fee) || 15000;
          const storedItems = parsedCart[restaurantId];
          const items: CartItem[] = [];

          storedItems.forEach(({ food_id, quantity }) => {
            const food = foods.find((f) => f.food_id === food_id);
            if (!food) return;

            items.push({
              restaurant_id: restaurantId,
              food_id: food.food_id,
              food_name: food.food_name,
              price: typeof food.price === 'number' ? food.price : parseFloat(String(food.price ?? 0)),
              image_url: food.image_url,
              description: food.description,
              quantity,
            });
          });

          if (items.length > 0) {
            groups.push({
              restaurant_id: restaurantId,
              restaurant_name: restaurantName,
              restaurant_image: restaurantImage,
              restaurant_latitude: restaurantLatitude,
              restaurant_longitude: restaurantLongitude,
              restaurant_delivery_fee: restaurantDeliveryFee,
              items,
            });
          }
        }

        const filteredGroups = selectedRestaurantId
          ? groups.filter((group) => group.restaurant_id === selectedRestaurantId)
          : groups;

        if (selectedRestaurantId && filteredGroups.length === 0) {
          toast.error("Không tìm thấy đơn hàng. Quý khách vui lòng thử lại sau.");
          router.push("/client/food-service/cart");
          return;
        }

        setCartData(filteredGroups);
      } catch (error) {
        console.error("Error loading cart data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartData();
  }, []);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);
        const user = parsed.user ?? parsed;
        setUserInfos({
          id: user.user_id || "",
          name: user.full_name || "",
          phone: user.phone_number || "",
          note: user.note || "",
        });
      } catch (err) {
        console.error("Lỗi khi parse userData:", err);
      }
    }
  }, []);

  useEffect(() => {
    const storedLocation = localStorage.getItem("userLocation");
    if (storedLocation) {
      try {
        const parsedLocation = JSON.parse(storedLocation);
        setUserLocation({
          location: parsedLocation.address || '',
          latitude: parseToNumber(parsedLocation.latitude) ?? undefined,
          longitude: parseToNumber(parsedLocation.longitude) ?? undefined,
        });
      } catch (error) {
        console.error("Error parsing user location:", error);
      }
    }
  }, []);

  const calculateGrandTotal = () => {
    return cartData.reduce(
      (total, restaurant) =>
        total + restaurant.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      0
    );
  };

  const getTotalItems = () => {
    return cartData.reduce(
      (total, restaurant) => total + restaurant.items.reduce((sum, item) => sum + item.quantity, 0),
      0
    );
  };

  const subtotal = calculateGrandTotal();
  const targetGroup = selectedRestaurantId
    ? cartData.find((group) => group.restaurant_id === selectedRestaurantId)
    : cartData?.[0];

  const estimatedDistance = estimateDistanceKm(
    userLocation.latitude,
    userLocation.longitude,
    targetGroup?.restaurant_latitude ?? undefined,
    targetGroup?.restaurant_longitude ?? undefined
  );

  const deliveryFee = calculateDeliveryFeeByDistance(
    estimatedDistance ?? -1,
    targetGroup?.restaurant_delivery_fee || 15000
  );
  const originalTotal = subtotal + deliveryFee;

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const restaurantId = selectedRestaurantId || cartData?.[0]?.restaurant_id;
        if (!restaurantId) return;

        const res = await fetch(`http://localhost:5001/api/coupons?restaurant_id=${restaurantId}`);
        const data = await res.json();

        if (data?.success && Array.isArray(data?.data?.coupons)) {
          setAvailableCoupons(data.data.coupons);
        }
      } catch (error) {
        console.error('Lỗi load coupons:', error);
      }
    };

    fetchCoupons();
  }, [selectedRestaurantId, cartData]);
  
  // Tính discount
  const calculateDiscount = () => {
    return validatedDiscount;
  };
  
  const discount = calculateDiscount();
  const totalAmount = Math.max(originalTotal - discount, 0);
  
  // Apply coupon
  const handleApplyCoupon = async (code?: string) => {
    const searchCode = (code || couponCode || '').trim();
    if (!searchCode) {
      toast.error('Vui lòng nhập mã coupon');
      return;
    }

    const localCoupon = availableCoupons.find((item) => item.code?.toUpperCase() === searchCode.toUpperCase());
    if (localCoupon) {
      const localReason = getCouponInvalidReason(localCoupon, originalTotal);
      if (localReason) {
        toast.warning(`Mã giảm giá này không phù hợp: ${localReason}`);
        return;
      }
    }

    try {
      setIsCouponLoading(true);
      const restaurantId = Number(selectedRestaurantId || cartData?.[0]?.restaurant_id);
      const res = await fetch('http://localhost:5001/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: searchCode,
          restaurant_id: restaurantId,
          order_total: originalTotal,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        setAppliedCoupon(null);
        setValidatedDiscount(0);
        toast.warning(data?.message || 'Mã giảm giá này không phù hợp');
        return;
      }

      const validatedCoupon = data?.data?.coupon as CouponItem;
      const discountAmount = Number(data?.data?.discount_amount || 0);

      setAppliedCoupon(validatedCoupon);
      setCouponCode(validatedCoupon.code);
      setValidatedDiscount(discountAmount);
      setShowCouponList(false);
      toast.success(`Áp dụng mã ${validatedCoupon.code} thành công!`);
    } catch (error) {
      console.error('Lỗi apply coupon:', error);
      toast.error('Lỗi khi áp dụng coupon');
    } finally {
      setIsCouponLoading(false);
    }
  };
  
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setValidatedDiscount(0);
    toast.info('Đã xóa mã giảm giá');
  };

  const handlePlaceOrder = async () => {
    if (!cartData || cartData.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    const targetGroups = selectedRestaurantId
      ? cartData.filter((g) => g.restaurant_id === selectedRestaurantId)
      : cartData;

    if (targetGroups.length === 0) {
      toast.error("Không tìm thấy dữ liệu đặt hàng.");
      return;
    }

    const group = targetGroups[0];

    if (appliedCoupon) {
      const reason = getCouponInvalidReason(appliedCoupon, originalTotal);
      if (reason) {
        toast.warning(`Mã giảm giá này không phù hợp: ${reason}`);
        return;
      }
    }

    const orderPayload = {
      orderData: {
        user_id: Number(userInfos.id) || null,
        restaurant_id: Number(group.restaurant_id),
        user_name: userInfos.name,
        user_phone: userInfos.phone,
        delivery_address: userLocation.location,
        delivery_latitude: userLocation.latitude ?? null,
        delivery_longitude: userLocation.longitude ?? null,
        notes: userInfos.note,
        delivery_fee: deliveryFee,
        original_total: originalTotal,
        discount_amount: appliedCoupon ? discount : 0,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        coupon_id: appliedCoupon ? appliedCoupon.id : null,
        total_amount: totalAmount,
        payment_method: paymentMethod,
      },
      items: group.items.map((item) => ({
        food_id: item.food_id,
        food_name: item.food_name,
        food_price: item.price,
        quantity: item.quantity,
      })),
    };

    if (paymentMethod === 'cash') {
      try {
        toast.info("Đang tạo đơn hàng...");
        
        const res = await fetch("http://localhost:5001/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });

        if (!res.ok) throw new Error("Tạo đơn hàng thất bại");

        const data = await res.json();
        const orderCode = data?.data?.order_code;

        try {
          const cart = JSON.parse(localStorage.getItem("cart") || "{}");
          const restaurantId = group.restaurant_id;
          if (restaurantId && cart[restaurantId]) {
            delete cart[restaurantId];
            localStorage.setItem("cart", JSON.stringify(cart));
            window.dispatchEvent(new Event("cart-updated"));
          }
        } catch (err) {
          console.error("Lỗi khi xóa cart:", err);
        }

        toast.success(`Đặt hàng thành công! Mã đơn: ${orderCode}`);
        
        setTimeout(() => {
          router.push("/client/food-service/orders");
        }, 1500);
       } catch (err) {
        console.error("Lỗi tạo đơn COD:", err);
        toast.error("Đặt hàng thất bại. Vui lòng thử lại!");
      }
    } else if (paymentMethod === 'card') {
      if (!selectedBank) {
        toast.error('Vui lòng chọn ngân hàng!');
        setShowBankSelector(true);
        return;
      }
      
      sessionStorage.setItem("pendingOrderPayload", JSON.stringify(orderPayload));
      sessionStorage.setItem("selectedBank", JSON.stringify(selectedBank));
      
      router.push(`/client/food-service/payment?restaurantId=${group.restaurant_id}`);
    } else {
      toast.error("Phương thức thanh toán không hợp lệ!");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }

  if (cartData.length === 0) {
    return <div className="flex justify-center items-center h-screen">Giỏ hàng trống</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Thanh toán</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ===== CỘT TRÁI - MAIN CONTENT ===== */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Địa chỉ giao hàng */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Địa chỉ giao hàng
                </h3>
                
                <button className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{userInfos.name}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{userInfos.phone}</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                  
                  <div className='w-full'>
                    <p className="text-gray-800 mb-3">
                      {userLocation.location}
                    </p>
                    
                    <textarea
                      maxLength={100}
                      className="text-sm text-gray-600 mt-1 placeholder:text-gray-400 w-full sm:w-[375px] p-2 rounded border border-gray-300"
                      placeholder="Ghi chú cho người giao hàng (Tối đa 100 ký tự)"
                      value={userInfos.note}
                      onChange={(e) => setUserInfos({ ...userInfos, note: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2️⃣ PAYMENT METHOD */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                Phương thức thanh toán
              </h3>
              
              <div className="space-y-3">
                {/* CHUYỂN KHOẢN */}
                <label className={`
                  group relative overflow-hidden cursor-pointer block
                  ${paymentMethod === 'card'
                     ? 'ring-2 ring-green-500 shadow-md'
                     : 'border border-gray-200 hover:border-green-300'
                  }
                  rounded-xl transition-all duration-200
                `}>
                  {paymentMethod === 'card' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 opacity-50" />
                  )}
                  
                  <div className="relative p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-0.5 w-4 h-4 text-green-600 cursor-pointer accent-green-600"
                      />
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg transition-all ${
                              paymentMethod === 'card'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <CreditCard className="w-4 h-4" />
                            </div>
                            
                            <div>
                              <span className="font-semibold text-gray-800 text-sm">Chuyển khoản ngân hàng</span>
                              {paymentMethod === 'card' && (
                                <span className="ml-2 px-1.5 py-0.5 bg-green-600 text-white text-xs rounded-full">
                                  Đang chọn
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Bank Selector */}
                        {paymentMethod === 'card' && (
                          <div className="space-y-2 animate-fadeIn">
                            {selectedBank ? (
                              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl">{selectedBank.logo}</span>
                                    <div>
                                      <p className="font-semibold text-sm text-gray-800">{selectedBank.name}</p>
                                      <p className="text-xs text-gray-600">{selectedBank.fullName}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setShowBankSelector(true)}
                                    className="px-2 py-1 bg-white hover:bg-green-50 border border-green-300 rounded text-xs font-medium text-green-700"
                                  >
                                    Đổi
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowBankSelector(true)}
                                className="w-full p-3 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
                              >
                                <div className="flex items-center justify-center gap-2 text-green-700 text-sm font-medium">
                                  <Building2 className="w-4 h-4" />
                                  <span>Chọn ngân hàng</span>
                                </div>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
                
                {/* TIỀN MẶT */}
                <label className={`
                  group relative overflow-hidden cursor-pointer block
                  ${paymentMethod === 'cash'
                     ? 'ring-2 ring-green-500 shadow-md'
                     : 'border border-gray-200 hover:border-green-300'
                  }
                  rounded-xl transition-all duration-200
                `}>
                  {paymentMethod === 'cash' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 opacity-50" />
                  )}
                  
                  <div className="relative p-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-green-600 cursor-pointer accent-green-600"
                      />
                      
                      <div className={`p-1.5 rounded-lg transition-all ${
                        paymentMethod === 'cash'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Wallet className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-gray-800 text-sm">Tiền mặt (COD)</span>
                          {paymentMethod === 'cash' && (
                            <span className="ml-2 px-1.5 py-0.5 bg-green-600 text-white text-xs rounded-full">
                              Đang chọn
                            </span>
                          )}
                          <p className="text-xs text-gray-600 mt-0.5">Thanh toán khi nhận hàng</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ===== CỘT PHẢI - ĐƠN HÀNG CỦA BẠN ===== */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 sticky top-24 space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 pb-3 border-b border-gray-100">
                <ShoppingBag className="w-5 h-5 text-green-600" />
                Đơn hàng của bạn
              </h3>
              
              {/* Chi tiết món ăn */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {cartData.map((restaurant) => (
                  <div key={restaurant.restaurant_id} className="space-y-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                      <img
                        src={restaurant.restaurant_image}
                        alt={restaurant.restaurant_name}
                        className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-xs text-gray-800">{restaurant.restaurant_name}</h4>
                        <p className="text-xs text-gray-500">{restaurant.items.length} món</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {restaurant.items.map((item) => (
                        <div key={`${item.restaurant_id}-${item.food_id}`} className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <img
                              src={item.image_url || ''}
                              alt={item.food_name}
                              className="w-10 h-10 rounded object-cover flex-shrink-0 border border-gray-100"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 truncate">{item.food_name}</p>
                              <p className="text-xs text-gray-500">x{item.quantity}</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-green-600 flex-shrink-0">
                            {(item.price * item.quantity).toLocaleString()}đ
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Mã giảm giá */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-orange-600" />
                  Mã giảm giá
                </h4>
                
                {appliedCoupon ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-100 rounded-lg">
                          <Gift className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-green-900">{appliedCoupon.code}</p>
                          <p className="text-xs font-semibold text-green-800">{appliedCoupon.title || 'Ưu đãi coupon'}</p>
                          <p className="text-xs text-green-700">{formatCouponBenefit(appliedCoupon)}</p>
                          <p className="text-xs text-green-700">{appliedCoupon.description || 'Mã giảm giá đã áp dụng'}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="p-1.5 hover:bg-green-100 rounded-lg transition-colors group"
                        title="Xóa mã giảm giá"
                      >
                        <X className="w-4 h-4 text-green-600 group-hover:text-green-700" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập mã"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleApplyCoupon();
                          }
                        }}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        onClick={() => handleApplyCoupon()}
                        disabled={isCouponLoading}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {isCouponLoading ? 'Đang kiểm tra...' : 'Áp dụng'}
                      </button>
                    </div>
                    
                    <button
                      onClick={() => setShowCouponList(!showCouponList)}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                    >
                      <Gift className="w-3 h-3" />
                      Xem mã khả dụng
                    </button>
                    
                    {showCouponList && (
                      <div className="space-y-1.5 animate-fadeIn">
                        {availableCoupons.length === 0 && (
                          <p className="text-xs text-gray-500 px-1 py-2">Chưa có coupon khả dụng</p>
                        )}
                        {availableCoupons.map(coupon => {
                          const invalidReason = getCouponInvalidReason(coupon, originalTotal);
                          const disabled = Boolean(invalidReason);

                          return (
                            <button
                              key={coupon.id}
                              onClick={() => handleApplyCoupon(coupon.code)}
                              disabled={disabled}
                              className={`w-full p-2 border rounded-lg transition-all text-left text-xs ${
                                disabled
                                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                  : 'border-orange-200 hover:border-orange-400 hover:bg-orange-50'
                              }`}
                            >
                              <p className="font-semibold text-gray-800">{coupon.code}</p>
                              <p className="text-xs font-semibold text-gray-700">{coupon.title || 'Coupon ưu đãi'}</p>
                              <p className="text-xs text-green-700">{formatCouponBenefit(coupon)}</p>
                              <p className="text-xs text-gray-600">{coupon.description || 'Áp dụng theo điều kiện coupon'}</p>
                              {invalidReason && (
                                <p className="text-xs text-red-500 mt-1">Không áp dụng: {invalidReason}</p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Tổng tiền */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính ({getTotalItems()} món)</span>
                  <span className="font-medium">{subtotal.toLocaleString()}đ</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí giao hàng</span>
                  <span className="font-medium">{deliveryFee.toLocaleString()}đ</span>
                </div>

                {typeof estimatedDistance === 'number' && (
                  <p className="text-xs text-gray-500">
                    Ước tính khoảng cách {estimatedDistance.toFixed(2)} km. Phí giao được tính theo khoảng cách từ nhà hàng đến địa chỉ của bạn.
                  </p>
                )}
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Giảm giá
                    </span>
                    <span className="font-semibold">-{discount.toLocaleString()}đ</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Tổng cộng</span>
                  <span className="font-bold text-2xl text-green-600">
                    {totalAmount.toLocaleString()}đ
                  </span>
                </div>
              </div>
              
              {/* Nút đặt hàng */}
              <button
                onClick={handlePlaceOrder}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Đặt hàng • {totalAmount.toLocaleString()}đ
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                Bằng việc đặt hàng, bạn đồng ý với Điều khoản sử dụng
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bank Selector Modal - Background mờ nhẹ hơn */}
      {showBankSelector && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Chọn ngân hàng</h2>
              <button
                onClick={() => setShowBankSelector(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {BANKS.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => {
                    setSelectedBank(bank);
                    setShowBankSelector(false);
                  }}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:border-green-500 hover:bg-green-50 ${
                    selectedBank?.id === bank.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{bank.logo}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{bank.name}</p>
                        <p className="text-xs text-gray-500">{bank.fullName}</p>
                      </div>
                    </div>
                    {selectedBank?.id === bank.id && (
                      <Check className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutClient;