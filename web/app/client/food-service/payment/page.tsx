"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  FaChevronLeft,
  FaCheckCircle,
  FaClock,
  FaShieldAlt,
  FaQrcode,
  FaCopy,
  FaCheck,
} from "react-icons/fa";
import Link from "next/link";

// Hàm tạo QR (cpy paste tạm)
const generateQRPattern = (seed: string) => {
  const size = 256;
  const blockSize = 16;
  const totalBlocks = (size / blockSize) ** 2;
  let pattern = Array(totalBlocks).fill(false);

  // random theo seed
  /* 
    quy ước như sau:  máy tính có 1 bộ đếm thời gian theo 1 con số có 1x chữ số.
      + Khi thử log trên console trị giá của thời gian hiện tại (VD: date.now()) thì là 1 chuỗi số rất dài.
      + chuỗi số ấy coi như 1 thời gian tiền chuyển đổi (tức là thời gian (x ngày, y giờ, z phút, t giây) tính từ 1970 đến hiện tại)
      + Nên có thể coi, mỗi lần log nó ra, chuỗi thời gian này "độc nhất" (vì thời gian không bao giờ lặp lại)
      + ý tưởng sẽ là mã hóa đơn hàng theo cái này.
  */
  for (let i = 0; i < totalBlocks; i++) {
    const hash = (seed.charCodeAt(i % seed.length) + i * 31) % 97;
    pattern[i] = hash % 2 === 0;
  }

  return pattern;
};

const PaymentPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const restaurantId = searchParams.get("restaurantId"); // lấy từ checkout và session/localStorage sang

  // 10 phút, hoặc set nó ngắn hơn nếu đang làm thử nghiệm
  const [timeLeft, setTimeLeft] = useState(600);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [orderData, setOrderData] = useState({
    orderId: orderId || "UNKNOWN",
    amount: 93500,
  });
  const [showTestToast, setShowTestToast] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Chỉ chạy ở client: lấy order từ sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("currentOrder");
      if (saved) {
        setOrderData(JSON.parse(saved));
      }
    }
  }, [orderId]);

  // Tạo pattern cố định dựa vào orderId
  const qrPattern = useMemo(
    () => generateQRPattern(orderData.orderId),
    [orderData.orderId]
  );

  // QR grid chỉ render 1 lần
  const qrGrid = useMemo(() => {
    return (
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-16 gap-0 h-full w-full">
          {qrPattern.map((isBlack, i) => (
            <div key={i} className={isBlack ? "bg-black" : "bg-white"} />
          ))}
        </div>
      </div>
    );
  }, [qrPattern]);

  // Đếm ngược
  // nhảy mỗi giây (1000ms)
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // copy mã đơn hàng cho khách.
  const copyToClipboard = () => {
    navigator.clipboard.writeText(orderData.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  /* 
    Đây là tính năng thử nghiệm, không phải tính năng thật.
      + Ý tưởng là, với tư cách 1 dev build web này, tôi có thể bỏ qua bước thanh toán thật. 
      + Tôi sẽ ko cần chuyển tiền thật, mà vẫn có thể test được luồng thanh toán thành công.

    Flow hoạt động như sau.
      + Khi bấm nút "Thử nghiệm nhanh", sẽ hiện toast thông báo góc trên, phải (đang ở chế độ thử nghiệm).
      + Sau 3 giây, trạng thái chuyển thành "thanh toán thành công"
      + Sau 8 giây nữa, toast tự biến mất.
  */
  const simulatePayment = () => {
    setIsProcessing(true);
    setShowTestToast(true);
    
    setTimeout(() => {
      setPaymentStatus("success");
      setIsProcessing(false);
      setTimeLeft(0); // Stop the timer
    }, 3000);

    setTimeout(() => {
      setShowTestToast(false);
    }, 8000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 mb-20">
      {/* Header */}
      <div className="flex items-center mb-6 mt-20">
        <Link
          href={`/client/food-service/checkout?restaurantId=${restaurantId || ""}`}
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
                
                <p className="text-xs text-gray-400">#{orderData.orderId}</p>
              </div>
            </div>

            <p className="mt-4 text-gray-600 text-sm">
              Vui lòng quét mã QR để thanh toán
            </p>
            
            {/* Test Payment Button */}
            <button onClick={simulatePayment} disabled={paymentStatus !== "pending" || isProcessing}
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
                  Thanh toán nhanh (thử nghiệm)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Order Info - Responsive chính xác */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>

            {/* Mã đơn hàng + tt chi tiết của đơn */}
            <div className="space-y-3 text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                <span className="text-gray-600 font-medium">Mã đơn hàng:</span>

                <div className="flex items-center gap-2 sm:justify-end">
                  <span className="font-mono text-sm text-gray-800 break-all">{orderData.orderId}</span>

                  <button onClick={copyToClipboard}
                    className="text-blue-500 hover:text-blue-700 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
                  </button>
                </div>
              </div>

              {/* Số tiền/ Đơn giá */}
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                <span className="text-gray-600 font-medium">Số tiền:</span>

                <span className="font-bold text-red-500 text-lg sm:text-right">
                  {orderData.amount.toLocaleString()} VND
                </span>
              </div>

              {/* Trạng thái */}
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                <span className="text-gray-600 font-medium">Trạng thái:</span>

                <span className={`font-semibold px-2 py-1 rounded-full text-xs inline-block w-fit sm:ml-auto 
                  ${paymentStatus === "pending" ? 
                    "bg-yellow-100 text-yellow-700" : paymentStatus === "success" ? 
                    "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  }
                `}>
                  {paymentStatus === "pending" ? "Chờ thanh toán" : paymentStatus === "success" ? "Thanh toán thành công": "Đang xử lý..."}
                </span>
              </div>

              {/* Thời gian còn lại */}
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                <span className="text-gray-600 font-medium">Thời gian còn lại:</span>

                <span className={`font-bold text-lg sm:text-right ${timeLeft <= 60 ? 'text-red-500' : 'text-gray-800'}`}>
                  {timeLeft > 0 ? formatTime(timeLeft) : 'Hết hạn'}
                </span>
              </div>
            </div>
          </div>

          {/* Mục lưu ý/ hướng dẫn cho khách hàng  */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-4">Lưu ý</h2>

            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>Vui lòng thanh toán trong vòng 10 phút</span>
              </li>

              <li className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <FaClock className="text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Quá thời gian, đơn hàng sẽ bị hủy</span>
              </li>
              
              <li className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                <FaShieldAlt className="text-purple-500 mt-0.5 flex-shrink-0" />
                <span>Đảm bảo nhập đúng số tiền và nội dung</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* toast/pop-up thông báo sau thanh toán */}
      {showTestToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-slide-in">
          <div className="bg-white border-l-4 border-purple-500 rounded-lg shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm">🧪</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Chế độ thử nghiệm
                </h4>
                <p className="text-xs text-gray-600 mb-2">
                  Đây là bản demo! Thanh toán sẽ được mô phỏng mà không cần chuyển tiền thật.
                </p>
                <div className="text-xs text-purple-600 font-medium">
                  ⚡ Đang xử lý thanh toán demo...
                </div>
              </div>
              <button 
                onClick={() => setShowTestToast(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
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