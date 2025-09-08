"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  FaChevronLeft,
  FaCheckCircle,
  FaClock,
  FaShieldAlt,
  FaQrcode,
  FaCopy,
  FaCheck,
  FaCheck as FaCheckIcon,
} from "react-icons/fa";

type BankInfo = {
  bankName: string;
  accountNumber: string;
  accountName: string;
  transferContent: string;
};

type OrderData = {
  orderId: string;
  amount: number;
  bankInfo: BankInfo;
};

// ---- Tạo pattern giả lập từ orderId (seed) ----
function generateQRPattern(seed: string, size: number = 256) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1000000007;
  }
  return Array.from({ length: size }, (_, i) => {
    const val = (hash + i * 9301 + 49297) % 233280;
    return val % 2 === 0; // true = ô đen, false = ô trắng
  });
}

const PaymentPage = () => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 phút = 600 giây
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "processing" | "success" | "failed"
  >("pending");
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ⚠️ ĐỪNG đọc sessionStorage trong render. Đọc 1 lần trong useEffect rồi setState.
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    // Chạy chỉ ở client
    if (typeof window === "undefined") return;

    const defaultBank = {
      bankName: "Vietcombank",
      accountNumber: "1234567890",
      accountName: "NGUYEN VAN A",
    };

    try {
      let orderId = "UNKNOWN";
      let amount = 0;
      let transferContent = "";

      const stored = window.sessionStorage.getItem("currentOrder");
      if (stored) {
        const parsed = JSON.parse(stored);

        orderId = parsed?.orderId || "UNKNOWN";
        amount =
          typeof parsed?.amount === "number"
            ? parsed.amount
            : Number(parsed?.amount) || 0;

        // Nếu có sẵn transferContent thì dùng, không thì suy từ orderId
        transferContent =
          parsed?.bankInfo?.transferContent || `DH ${String(orderId).slice(-8)}`;
      } else {
        // Fallback: lấy từ URL nếu không có session
        const params = new URLSearchParams(window.location.search);
        const qId = params.get("orderId");
        const qAmount = Number(params.get("amount") || 0);

        orderId = qId || "UNKNOWN";
        amount = Number.isNaN(qAmount) ? 0 : qAmount;
        transferContent = `DH ${String(orderId).slice(-8)}`;
      }

      setOrderData({
        orderId,
        amount,
        bankInfo: {
          ...defaultBank,
          transferContent,
        },
      });
    } catch (e) {
      console.error("Error loading order data:", e);
      // fallback an toàn
      setOrderData({
        orderId: "UNKNOWN",
        amount: 0,
        bankInfo: {
          bankName: "Vietcombank",
          accountNumber: "1234567890",
          accountName: "NGUYEN VAN A",
          transferContent: "DH UNKNOWN",
        },
      });
    }
  }, []);

  // Đếm ngược
  useEffect(() => {
    if (paymentStatus !== "pending") return; // dừng nếu không còn pending
    if (timeLeft <= 0) {
      setPaymentStatus("failed");
      return;
    }
    const id = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [timeLeft, paymentStatus]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = (text: string): void => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Confirm (demo)
  const handlePaymentConfirm = () => {
    setIsProcessing(true);
    setPaymentStatus("processing");

    // GIẢ LẬP gọi API
    setTimeout(() => {
      setPaymentStatus("success");
      setIsProcessing(false);

      // Xử lý xóa cart và redirect
      setTimeout(() => {
        try {
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            const urlParams = new URLSearchParams(window.location.search);
            const selectedRestaurantId = urlParams.get("restaurantId");

            if (selectedRestaurantId) {
              delete parsedCart[selectedRestaurantId];
            } else {
              const orderRestaurants = JSON.parse(
                sessionStorage.getItem("currentOrderRestaurants") || "[]"
              );
              orderRestaurants.forEach((restaurantId: string) => {
                delete parsedCart[restaurantId];
              });
            }

            localStorage.setItem("cart", JSON.stringify(parsedCart));
            window.dispatchEvent(new Event("cart-updated"));
          }

          window.location.href = "/client/food-service/cart";
        } catch (error) {
          console.error("Error processing order:", error);
          window.location.href = "/client/food-service/cart";
        }
      }, 1500);
    }, 3000);
  };

  // Pattern QR cố định theo orderId
  const qrPattern = useMemo(() => {
    if (!orderData?.orderId) return [];
    return generateQRPattern(orderData.orderId);
  }, [orderData?.orderId]);

  // Grid QR được memo hóa → không thay đổi giữa các render
  const qrGrid = useMemo(() => {
    if (!qrPattern.length) return null;
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

  // Chưa có orderData thì show loading ngắn (tránh render khi window chưa sẵn sàng)
  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-gray-700">Đang tải thông tin thanh toán…</p>
        </div>
      </div>
    );
  }

  // ---- UI các trạng thái ----
  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Thanh toán thành công!
          </h2>
          <p className="text-gray-600 mb-6">
            Đơn hàng #{orderData.orderId} đã được thanh toán và xác nhận.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaClock className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Hết thời gian thanh toán
          </h2>
          <p className="text-gray-600 mb-6">
            Phiên thanh toán đã hết hạn. Vui lòng thử lại.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setPaymentStatus("pending");
                setTimeLeft(600);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Thử lại
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- UI chính ----
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FaChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-800">Thanh toán QR</h1>
            </div>
            <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
              <FaClock className="w-4 h-4" />
              <span className="font-semibold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Payment Status */}
        {paymentStatus === "processing" && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <h3 className="font-semibold text-blue-800">
                  Đang xử lý thanh toán
                </h3>
                <p className="text-sm text-blue-600">
                  Vui lòng chờ trong giây lát...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Quét mã QR để thanh toán
            </h2>
            <p className="text-gray-600">
              Sử dụng ứng dụng ngân hàng để quét mã QR
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200">
              <div className="w-64 h-64 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden">
                {qrGrid}
                <div className="relative z-10 text-center">
                  <FaQrcode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">QR Payment</p>
                  <p className="text-xs text-gray-400">#{orderData.orderId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-1">Số tiền cần thanh toán</p>
            <p className="text-3xl font-bold text-green-600">
              {orderData.amount.toLocaleString("vi-VN")}đ
            </p>
          </div>

          {/* Confirm Button (demo) */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <FaShieldAlt className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-800">
                Chế độ thử nghiệm
              </span>
            </div>
            <p className="text-sm text-yellow-700 mb-4">
              Đây là phiên bản demo. Bấm nút bên dưới để mô phỏng thanh toán
              thành công.
            </p>

            <button
              onClick={handlePaymentConfirm}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold 
                transition-colors flex items-center justify-center gap-2 cursor-pointer duration-150
              "
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <FaCheckIcon className="w-4 h-4" />
                  Xác nhận thanh toán (Demo)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bank Information */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Thông tin chuyển khoản
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ngân hàng</p>
              <p className="font-semibold text-gray-800">
                {orderData.bankInfo.bankName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Số tài khoản</p>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span className="font-mono font-semibold">
                  {orderData.bankInfo.accountNumber}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(orderData.bankInfo.accountNumber)
                  }
                  className="text-green-600 hover:text-green-700 p-1"
                >
                  {copied ? <FaCheck className="w-4 h-4" /> : <FaCopy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Chủ tài khoản</p>
              <p className="font-semibold text-gray-800">
                {orderData.bankInfo.accountName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Nội dung chuyển khoản</p>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span className="font-mono font-semibold text-red-600">
                  {orderData.bankInfo.transferContent}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(orderData.bankInfo.transferContent)
                  }
                  className="text-green-600 hover:text-green-700 p-1"
                >
                  {copied ? <FaCheck className="w-4 h-4" /> : <FaCopy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Hướng dẫn thanh toán</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Mở ứng dụng ngân hàng trên điện thoại</li>
            <li>Chọn chức năng "Quét QR" hoặc "Chuyển khoản QR"</li>
            <li>Quét mã QR phía trên</li>
            <li>Kiểm tra thông tin và xác nhận thanh toán</li>
            <li>Giữ lại biên lai để đối chiếu</li>
          </ol>
          <p className="text-xs text-blue-600 mt-3 font-medium">
            ⚠️ Lưu ý: Chuyển khoản đúng nội dung để đơn hàng được xử lý tự động
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
