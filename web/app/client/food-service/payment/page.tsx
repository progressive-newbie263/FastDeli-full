"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaChevronLeft, FaQrcode } from "react-icons/fa";
import Link from "next/link";

const generateQRPattern = (seed: string) => {
  const size = 256;
  const blockSize = 16;
  const totalBlocks = (size / blockSize) ** 2;
  let pattern = Array(totalBlocks).fill(false);

  for (let i = 0; i < totalBlocks; i++) {
    const hash = (seed.charCodeAt(i % seed.length) + i * 31) % 97;
    pattern[i] = hash % 2 === 0;
  }
  return pattern;
};

const PaymentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdFromQuery = searchParams.get("orderId");
  const restaurantIdFromQuery = searchParams.get("restaurantId");

  const [timeLeft, setTimeLeft] = useState(600);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "processing">("pending");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [payload, setPayload] = useState<any>(null);

  // Lấy dữ liệu order từ sessionStorage hoặc localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = sessionStorage.getItem("pendingOrderPayload");
      if (saved) {
        setPayload(JSON.parse(saved));
        return;
      }

      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const cart = JSON.parse(localStorage.getItem("cart") || "{}");
      const restaurantId = restaurantIdFromQuery || Object.keys(cart)[0] || "0";

      const cartItems = cart[restaurantId] || [];


      // note: ko dùng subtotal trong database, nhưng có thể ghi tạm nó như thế này
      // cho dễ tính toán đơn giá
      const items = cartItems.map((item: any) => ({
        food_id: item.food_id,
        food_name: item.food_name || "",
        food_price: item.food_price || 0,
        quantity: item.quantity,
        subtotal: (item.food_price || 0) * item.quantity,
      }));

      const orderPayload = {
        orderData: {
          user_id: userData.user_id,
          restaurant_id: Number(restaurantId),
          user_name: userData.name || "Khách hàng",
          user_phone: userData.phone_number,
          delivery_address: userData.address || "Chưa có địa chỉ",
          notes: "",
          delivery_fee: 15000,
          total_amount: items.reduce((sum: number, i: {subtotal: number}) => sum + i.subtotal, 0),
        },
        items,
      };

      setPayload(orderPayload);
      sessionStorage.setItem("pendingOrderPayload", JSON.stringify(orderPayload));
    } catch (err) {
      console.error("Lỗi đọc dữ liệu:", err);
    }
  }, [restaurantIdFromQuery]);

  // QR code pattern
  const qrPattern = useMemo(
    () => generateQRPattern(orderIdFromQuery || String(Date.now())),
    [orderIdFromQuery]
  );

  const qrGrid = useMemo(
    () => (
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-16 gap-0 h-full w-full">
          {qrPattern.map((isBlack, i) => (
            <div key={i} className={isBlack ? "bg-black" : "bg-white"} />
          ))}
        </div>
      </div>
    ),
    [qrPattern]
  );

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleCreateOrder = async () => {
    try {
      setIsProcessing(true);
      setShowToast(true);

      const res = await fetch("http://localhost:5001/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Tạo đơn hàng thất bại");

      const data = await res.json();
      console.log("✅ Đơn hàng đã tạo:", data);

      // 🧹 XÓA CART CỦA NHÀ HÀNG ĐÃ ĐẶT
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "{}");
        const restaurantId = payload.orderData.restaurant_id;
        if (restaurantId && cart[restaurantId]) {
          delete cart[restaurantId];
          localStorage.setItem("cart", JSON.stringify(cart));

          // BẮN SỰ KIỆN để các component khác cập nhật UI
          window.dispatchEvent(new Event("cart-updated"));
        }
      } catch (err) {
        console.error("❌ Lỗi khi xóa cart:", err);
      }

      // Cập nhật trạng thái UI ngay
      setPaymentStatus("success");
      setIsProcessing(false);
      setTimeLeft(0);

      // Điều hướng sang /orders sau 1.5s
      setTimeout(() => {
        router.push("/client/food-service/orders");
      }, 1500);

      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      console.error("❌ Lỗi tạo đơn:", err);
      setIsProcessing(false);
    }
  };


  if (!payload) {
    return <div className="flex justify-center items-center h-screen">Đang tải thông tin đơn hàng...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 mb-20">
      {/* Header */}
      <div className="flex items-center mb-6 mt-20">
        <Link
          href={`/client/food-service/checkout?restaurantId=${payload.orderData.restaurant_id || ""}`}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <FaChevronLeft className="text-gray-600 mr-2 cursor-pointer" />
        </Link>
        <h1 className="text-xl font-semibold">Thanh toán đơn hàng</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* QR Code */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex flex-col items-center">
            <div className="w-64 h-64 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden">
              {qrGrid}
              <div className="relative z-10 text-center">
                <FaQrcode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">QR Payment</p>
                <p className="text-xs text-gray-400">#{orderIdFromQuery || "NEW"}</p>
              </div>
            </div>

            <p className="mt-4 text-gray-600 text-sm">
              Vui lòng quét mã QR để thanh toán
            </p>

            {/* Nút xác nhận */}
            <button
              onClick={handleCreateOrder}
              disabled={paymentStatus !== "pending" || isProcessing}
              className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 disabled:cursor-not-allowed cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <span className="text-lg">⚡</span>
                  Thanh toán nhanh
                </>
              )}
            </button>
          </div>
        </div>

        {/* Thông tin đơn */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Số tiền:</span>
                <span className="font-bold text-red-500 text-lg sm:text-right">
                  {payload.orderData.total_amount?.toLocaleString() || 0} VND
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Trạng thái:</span>
                <span
                  className={`font-semibold px-2 py-1 rounded-full text-xs 
                  ${
                    paymentStatus === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : paymentStatus === "success"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {paymentStatus === "pending"
                    ? "Chờ thanh toán"
                    : paymentStatus === "success"
                    ? "Thanh toán thành công"
                    : "Đang xử lý..."}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Thời gian còn lại:</span>
                <span
                  className={`font-bold text-lg sm:text-right ${
                    timeLeft <= 60 ? "text-red-500" : "text-gray-800"
                  }`}
                >
                  {timeLeft > 0 ? formatTime(timeLeft) : "Hết hạn"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast demo */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-slide-in">
          <div className="bg-white border-l-4 border-purple-500 rounded-lg shadow-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Đang xử lý thanh toán...
            </h4>
            <p className="text-xs text-gray-600">
              Đây là chế độ demo. Thanh toán sẽ được mô phỏng mà không trừ tiền thật.
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PaymentPage;
