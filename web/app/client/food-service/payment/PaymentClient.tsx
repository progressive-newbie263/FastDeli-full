"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, QrCode, Building2, Check } from "lucide-react";
import Link from "next/link";

// Danh sách ngân hàng hỗ trợ VietQR (học từ payment-gate)
interface Bank {
  id: string;
  name: string;
  fullName: string;
  bin: string;
  logo: string;
}

const BANKS: Bank[] = [
  { 
    id: 'VCB', 
    name: 'Vietcombank', 
    fullName: 'Ngân hàng TMCP Ngoại Thương Việt Nam',
    bin: '970436',
    logo: '🏦'
  },
  { 
    id: 'MB', 
    name: 'MB Bank', 
    fullName: 'Ngân hàng TMCP Quân Đội',
    bin: '970422',
    logo: '🏦'
  },
  { 
    id: 'TCB', 
    name: 'Techcombank', 
    fullName: 'Ngân hàng TMCP Kỹ Thương Việt Nam',
    bin: '970407',
    logo: '🏦'
  },
  { 
    id: 'ACB', 
    name: 'ACB', 
    fullName: 'Ngân hàng TMCP Á Châu',
    bin: '970416',
    logo: '🏦'
  },
  { 
    id: 'VPB', 
    name: 'VPBank', 
    fullName: 'Ngân hàng TMCP Việt Nam Thịnh Vượng',
    bin: '970432',
    logo: '🏦'
  },
];

// Thông tin tài khoản nhận (của FastDeli)
const ACCOUNT_NUMBER = '0781000503328';
const ACCOUNT_NAME = 'NGUYEN VINH QUANG';

const PaymentClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantIdFromQuery = searchParams.get("restaurantId");

  const [timeLeft, setTimeLeft] = useState(300); // 5 phút
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "failed">("pending");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [payload, setPayload] = useState<any>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  
  // State cho QR Banking (học từ payment-gate)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showBankSelector, setShowBankSelector] = useState(false);

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
          total_amount: items.reduce((sum: number, i: { subtotal: number }) => sum + i.subtotal, 0) + 15000,
        },
        items,
      };

      setPayload(orderPayload);
      sessionStorage.setItem("pendingOrderPayload", JSON.stringify(orderPayload));
    } catch (err) {
      console.error("Lỗi đọc dữ liệu:", err);
    }
  }, [restaurantIdFromQuery]);

  // Generate QR Code khi đã chọn bank (học từ payment-gate)
  const generateQRCode = () => {
    if (!selectedBank || !orderId || !orderCode) {
      setToastMessage("Vui lòng tạo đơn hàng và chọn ngân hàng trước!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const amount = payload?.orderData?.total_amount || 0;
    const qrUrl = `https://img.vietqr.io/image/${selectedBank.bin}-${ACCOUNT_NUMBER}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(orderCode)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;
    
    setQrCodeUrl(qrUrl);
    setShowBankSelector(false);
    
    console.log(`✅ QR Code generated for ${selectedBank.name}:`, qrUrl);
  };

  // Auto-generate QR khi chọn bank
  useEffect(() => {
    if (selectedBank && orderId && orderCode) {
      generateQRCode();
    }
  }, [selectedBank, orderId, orderCode]);

  // Countdown timer (300s = 5 phút như payment-gate)
  useEffect(() => {
    if (timeLeft <= 0 || paymentStatus !== "pending") return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, paymentStatus]);

  // Auto-redirect khi hết thời gian
  useEffect(() => {
    if (timeLeft === 0 && paymentStatus === "pending") {
      setToastMessage("⏱️ Hết thời gian thanh toán! Đơn hàng sẽ bị hủy.");
      setShowToast(true);
      setPaymentStatus("failed");
      
      setTimeout(() => {
        router.push("/client/food-service/restaurants");
      }, 3000);
    }
  }, [timeLeft, paymentStatus, router]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Bước 1: Tạo đơn hàng (chưa thanh toán)
  const handleCreateOrder = async () => {
    if (!payload) {
      setToastMessage("❌ Không có dữ liệu đơn hàng");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    try {
      setIsProcessing(true);
      setToastMessage("🔄 Đang tạo đơn hàng...");
      setShowToast(true);

      const res = await fetch("http://localhost:5001/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Tạo đơn hàng thất bại");

      const data = await res.json();
      const newOrderId = data?.data?.id;
      const code = data?.data?.order_code;
      
      setOrderCode(code || null);
      setOrderId(newOrderId || null);

      setToastMessage(`✅ Tạo đơn ${code} thành công! Vui lòng chọn ngân hàng.`);
      setShowToast(true);
      setShowBankSelector(true); // Hiện danh sách ngân hàng
      
      setTimeout(() => setShowToast(false), 3000);
      setIsProcessing(false);
    } catch (err) {
      console.error("❌ Lỗi tạo đơn:", err);
      setToastMessage("❌ Lỗi tạo đơn hàng");
      setShowToast(true);
      setIsProcessing(false);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Bước 2: Giả lập thanh toán (gọi webhook)
  const handleSimulatePayment = async () => {
    if (!orderId) {
      setToastMessage("❌ Chưa có đơn hàng để thanh toán");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    try {
      setIsProcessing(true);
      setToastMessage("⚡ Đang xử lý thanh toán...");
      setShowToast(true);

      // Gọi webhook simulation
      const webhookRes = await fetch("http://localhost:5001/api/payments/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          payment_status: "paid",
          transaction_id: `TXN${Date.now()}`,
          bank_code: selectedBank?.id || "VCB",
        }),
      });

      if (!webhookRes.ok) throw new Error("Webhook thất bại");

      const webhookData = await webhookRes.json();
      console.log("✅ Webhook response:", webhookData);

      // Xóa cart
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "{}");
        const restaurantId = payload.orderData.restaurant_id;
        if (restaurantId && cart[restaurantId]) {
          delete cart[restaurantId];
          localStorage.setItem("cart", JSON.stringify(cart));
          window.dispatchEvent(new Event("cart-updated"));
        }
      } catch (err) {
        console.error("❌ Lỗi khi xóa cart:", err);
      }

      setPaymentStatus("paid");
      setTimeLeft(0);
      setToastMessage("✅ Thanh toán thành công!");
      setShowToast(true);

      setTimeout(() => {
        router.push("/client/food-service/orders");
      }, 2000);

      setIsProcessing(false);
    } catch (err) {
      console.error("❌ Lỗi thanh toán:", err);
      setToastMessage("❌ Lỗi khi xử lý thanh toán");
      setShowToast(true);
      setPaymentStatus("failed");
      setIsProcessing(false);
      setTimeout(() => setShowToast(false), 3000);
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
          <ChevronLeft className="text-gray-600 mr-2 cursor-pointer" />
        </Link>
        <h1 className="text-xl font-semibold">Thanh toán đơn hàng</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* QR Code & Bank Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex flex-col items-center">
            {/* QR Display */}
            {qrCodeUrl ? (
              <div className="w-64 h-64 bg-white border-2 border-green-500 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Payment" 
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">
                    {!orderId ? "Tạo đơn hàng để hiển thị QR" : "Chọn ngân hàng để tạo QR"}
                  </p>
                </div>
              </div>
            )}

            {/* Bank Info */}
            {selectedBank && (
              <div className="mt-4 text-center bg-green-50 p-3 rounded-lg w-full">
                <p className="text-sm text-gray-600">Ngân hàng</p>
                <p className="font-semibold text-green-700">{selectedBank.name}</p>
                <p className="text-xs text-gray-500">{selectedBank.fullName}</p>
              </div>
            )}

            {/* Payment Instructions */}
            {qrCodeUrl && (
              <div className="mt-4 bg-blue-50 p-4 rounded-lg w-full">
                <h3 className="font-semibold text-blue-900 mb-2 text-sm">Hướng dẫn thanh toán:</h3>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Mở app ngân hàng của bạn</li>
                  <li>Quét mã QR phía trên</li>
                  <li>Kiểm tra thông tin và xác nhận</li>
                  <li>Click "Thanh toán nhanh" bên dưới</li>
                </ol>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 w-full space-y-3">
              {!orderId ? (
                <button
                  onClick={handleCreateOrder}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Building2 className="w-5 h-5" />
                      Tạo đơn hàng
                    </>
                  )}
                </button>
              ) : !qrCodeUrl ? (
                <button
                  onClick={() => setShowBankSelector(!showBankSelector)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                >
                  <Building2 className="w-5 h-5 inline mr-2" />
                  Chọn ngân hàng
                </button>
              ) : (
                <button
                  onClick={handleSimulatePayment}
                  disabled={paymentStatus !== "pending" || isProcessing}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
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
              )}
            </div>
          </div>
        </div>

        {/* Thông tin đơn */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>

            <div className="space-y-3 text-sm">
              {orderCode && (
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Mã đơn:</span>
                  <span className="font-bold text-blue-600">#{orderCode}</span>
                </div>
              )}

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
                      : paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }
                  `}
                >
                  {paymentStatus === "pending"
                    ? "Chờ thanh toán"
                    : paymentStatus === "paid"
                    ? "Thanh toán thành công"
                    : "Thất bại"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Thời gian còn lại:</span>
                <span
                  className={`font-bold text-lg sm:text-right ${
                    timeLeft <= 60 ? "text-red-500 animate-pulse" : "text-gray-800"
                  }`}
                >
                  {timeLeft > 0 ? formatTime(timeLeft) : "Hết hạn"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Selector Modal */}
      {showBankSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
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
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-200 hover:border-green-500 hover:bg-green-50 ${
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

            <p className="mt-4 text-xs text-gray-500 text-center">
              Chọn ngân hàng để tạo mã QR thanh toán
            </p>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-slide-in">
          <div className={`border-l-4 rounded-lg shadow-lg p-4 ${
            toastMessage.includes("✅") ? "bg-white border-green-500" :
            toastMessage.includes("❌") ? "bg-white border-red-500" :
            toastMessage.includes("⏱️") ? "bg-white border-orange-500" :
            "bg-white border-purple-500"
          }`}>
            <p className="text-sm font-medium text-gray-900">
              {toastMessage}
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

export default PaymentClient;
