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
  type ToastType = "success" | "error" | "warning" | "info";

  const [timeLeft, setTimeLeft] = useState(300); // 5 phút
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "failed">("pending");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("info");

  const [payload, setPayload] = useState<any>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [tempReference, setTempReference] = useState<string>("");
  
  // State cho QR Banking (học từ payment-gate)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showBankSelector, setShowBankSelector] = useState(false);

  const showToastMessage = (message: string, type: ToastType = "info", duration = 3000) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    if (duration > 0) {
      setTimeout(() => setShowToast(false), duration);
    }
  };

  const originalTotal = Number(payload?.orderData?.original_total || payload?.orderData?.total_amount || 0);
  const deliveryFee = Number(payload?.orderData?.delivery_fee || 0);
  const discountAmount = Number(payload?.orderData?.discount_amount || 0);
  const couponCode = payload?.orderData?.coupon_code || null;

  // Lấy dữ liệu order từ sessionStorage hoặc localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      setTempReference(`FD-${Date.now()}`);

      const saved = sessionStorage.getItem("pendingOrderPayload");
      if (saved) {
        setPayload(JSON.parse(saved));
      }
      
      // Lấy bank đã chọn từ checkout
      const savedBank = sessionStorage.getItem("selectedBank");
      if (savedBank) {
        setSelectedBank(JSON.parse(savedBank));
      }
    } catch (err) {
      console.error("Lỗi đọc dữ liệu:", err);
    }
  }, [restaurantIdFromQuery]);

  // Generate QR Code khi đã chọn bank (học từ payment-gate)
  const generateQRCode = () => {
    if (!selectedBank || !payload?.orderData) {
      showToastMessage("Thiếu dữ liệu thanh toán hoặc ngân hàng", "warning");
      return;
    }

    const amount = payload?.orderData?.total_amount || 0;
    const reference = orderCode || tempReference || `FD-${Date.now()}`;
    const qrUrl = `https://img.vietqr.io/image/${selectedBank.bin}-${ACCOUNT_NUMBER}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(reference)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;
    
    setQrCodeUrl(qrUrl);
    setShowBankSelector(false);
    
    console.log(`QR Code generated for ${selectedBank.name}:`, qrUrl);
  };

  // Auto-generate QR khi chọn bank
  useEffect(() => {
    if (selectedBank && payload?.orderData) {
      generateQRCode();
    }
  }, [selectedBank, orderCode, payload, tempReference]);

  // Countdown timer (300s = 5 phút như payment-gate)
  useEffect(() => {
    if (timeLeft <= 0 || paymentStatus !== "pending") return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, paymentStatus]);

  // Auto-redirect khi hết thời gian
  useEffect(() => {
    if (timeLeft === 0 && paymentStatus === "pending") {
      showToastMessage("Hết thời gian thanh toán! Đơn hàng sẽ bị hủy.", "warning");
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

  const handleCreateOrder = async () => {
    if (!payload) {
      throw new Error("Thiếu payload để tạo đơn");
    }

    if (orderId && orderCode) {
      return {
        id: orderId,
        code: orderCode,
      };
    }

    try {
      showToastMessage("Đang tạo đơn hàng...", "info", 0);

      const res = await fetch("http://localhost:5001/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Tạo đơn hàng thất bại");

      const data = await res.json();
      const newOrderId = data?.data?.id;
      const code = data?.data?.order_code;

      if (!newOrderId || !code) {
        throw new Error("Không nhận được mã đơn hàng từ server");
      }
      
      setOrderCode(code);
      setOrderId(newOrderId);

      showToastMessage(`Tạo đơn ${code} thành công!`, "success");
      return { id: newOrderId, code };
    } catch (err) {
      console.error("Lỗi tạo đơn:", err);
      showToastMessage("Lỗi tạo đơn hàng", "error");
      throw err;
    }
  };

  // Bước 2: Giả lập thanh toán (gọi webhook)
  const handleSimulatePayment = async () => {
    if (!payload) {
      showToastMessage("Thiếu dữ liệu thanh toán", "warning");
      return;
    }

    try {
      setIsProcessing(true);
      showToastMessage("Đang xử lý thanh toán...", "info", 0);

      const createdOrder = await handleCreateOrder();
      const targetOrderId = createdOrder.id;

      if (!targetOrderId) {
        throw new Error("Không thể tạo đơn hàng trước khi thanh toán");
      }

      // Gọi webhook simulation
      const webhookRes = await fetch("http://localhost:5001/api/payments/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: targetOrderId,
          payment_status: "paid",
          transaction_id: `TXN${Date.now()}`,
          bank_code: selectedBank?.id || "VCB",
        }),
      });

      if (!webhookRes.ok) throw new Error("Webhook thất bại");

      const webhookData = await webhookRes.json();
      console.log("Webhook response:", webhookData);

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
        console.error("Lỗi khi xóa cart:", err);
      }

      setPaymentStatus("paid");
      setTimeLeft(0);
      showToastMessage("Thanh toán thành công!", "success");
      sessionStorage.removeItem("pendingOrderPayload");
      sessionStorage.removeItem("selectedBank");

      setTimeout(() => {
        router.push("/client/food-service/orders");
      }, 2000);

      setIsProcessing(false);
    } catch (err) {
      console.error("Lỗi thanh toán:", err);
      showToastMessage("Lỗi khi xử lý thanh toán", "error");
      setPaymentStatus("failed");
      setIsProcessing(false);
    }
  };


  if (!payload) {
    return <div className="flex justify-center items-center h-screen">Đang tải thông tin đơn hàng...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/20 to-gray-50 pb-20">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/client/food-service/checkout?restaurantId=${payload?.orderData?.restaurant_id || ""}`}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-800">Thanh toán đơn hàng</h1>
              {orderCode && (
                <p className="text-sm text-gray-600">Mã đơn: <span className="font-semibold text-blue-600">#{orderCode}</span></p>
              )}
            </div>
            {/* Countdown Timer */}
            <div className={`px-4 py-2 rounded-lg ${
              timeLeft <= 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <div className="text-xs font-medium">Thời gian còn lại</div>
              <div className={`text-lg font-bold ${timeLeft <= 60 ? 'animate-pulse' : ''}`}>
                {timeLeft > 0 ? formatTime(timeLeft) : "Hết hạn"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* QR Code Section - Left (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <div className="flex flex-col items-center">
                {/* QR Display */}
                {qrCodeUrl ? (
                  <div className="w-full max-w-sm space-y-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Payment" 
                        className="w-full aspect-square object-contain rounded-lg"
                      />
                    </div>
                    
                    {/* Bank Info */}
                    {selectedBank && (
                      <div className="bg-white border-2 border-green-200 rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-gray-600 mb-1">Ngân hàng thanh toán</p>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{selectedBank.logo}</span>
                          <div>
                            <p className="font-bold text-gray-900">{selectedBank.name}</p>
                            <p className="text-xs text-gray-600">{selectedBank.fullName}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full max-w-sm">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center">
                      <div className="text-center p-6">
                        <QrCode className="w-20 h-20 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 font-medium">
                          Đang tạo mã QR thanh toán...
                        </p>
                        <div className="mt-4 flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Instructions */}
                {qrCodeUrl && (
                  <div className="mt-6 w-full max-w-sm space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 p-6 rounded-xl">
                      <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <span className="text-lg">📱</span>
                        Hướng dẫn thanh toán
                      </h3>
                      <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                        <li>Mở app ngân hàng {selectedBank?.name}</li>
                        <li>Chọn <strong>Quét mã QR</strong></li>
                        <li>Quét mã QR bên trên</li>
                        <li>Kiểm tra thông tin và <strong>Xác nhận</strong></li>
                        <li>Bấm <strong>"Thanh toán nhanh"</strong> bên dưới</li>
                      </ol>
                    </div>

                    {/* Payment Button */}
                    <button
                      onClick={handleSimulatePayment}
                      disabled={paymentStatus !== "pending" || isProcessing}
                      className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <span className="text-xl">⚡</span>
                          Tôi đã thanh toán
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Info - Right (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Status */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Trạng thái</h3>
              <div className={`p-4 rounded-xl text-center font-bold text-lg ${
                paymentStatus === "pending"
                  ? "bg-yellow-50 text-yellow-700 border-2 border-yellow-200"
                  : paymentStatus === "paid"
                  ? "bg-green-50 text-green-700 border-2 border-green-200"
                  : "bg-red-50 text-red-700 border-2 border-red-200"
              }`}>
                {paymentStatus === "pending" && "Chờ thanh toán"}
                {paymentStatus === "paid" && "Thanh toán thành công"}
                {paymentStatus === "failed" && "Thất bại"}
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Chi tiết đơn hàng</h3>
              
              <div className="space-y-3">
                {/* Items */}
                {payload?.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm pb-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.food_name}</p>
                      <p className="text-xs text-gray-500">x{item.quantity} • {item.food_price.toLocaleString()}đ</p>
                    </div>
                    <span className="font-semibold text-gray-800">
                      {(item.food_price * item.quantity).toLocaleString()}đ
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Total */}
              <div className="mt-4 pt-4 border-t-2 border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">
                    {(originalTotal - deliveryFee).toLocaleString()}đ
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí giao hàng</span>
                    <span className="font-medium">{deliveryFee.toLocaleString()}đ</span>
                </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="text-gray-600">Giảm giá {couponCode ? `(${couponCode})` : ''}</span>
                      <span className="font-medium">-{discountAmount.toLocaleString()}đ</span>
                    </div>
                  )}
                <div className="flex justify-between text-lg font-bold text-green-600 pt-2 border-t border-gray-200">
                  <span>Tổng cộng</span>
                  <span>{payload?.orderData?.total_amount?.toLocaleString() || 0}đ</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Thông tin giao hàng</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Người nhận</p>
                  <p className="font-medium text-gray-800">{payload?.orderData?.user_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Số điện thoại</p>
                  <p className="font-medium text-gray-800">{payload?.orderData?.user_phone}</p>
                </div>
                <div>
                  <p className="text-gray-600">Địa chỉ</p>
                  <p className="font-medium text-gray-800">{payload?.orderData?.delivery_address}</p>
                </div>
                {payload?.orderData?.notes && (
                  <div>
                    <p className="text-gray-600">Ghi chú</p>
                    <p className="font-medium text-gray-800">{payload?.orderData?.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-slide-in">
          <div className={`border-l-4 rounded-lg shadow-lg p-4 ${
            toastType === "success" ? "bg-white border-green-500" :
            toastType === "error" ? "bg-white border-red-500" :
            toastType === "warning" ? "bg-white border-orange-500" :
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
