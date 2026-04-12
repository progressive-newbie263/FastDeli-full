'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Restaurant, Food } from '../../interfaces';
import { useAuth } from '@food/context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MapPin, Phone, Star, Truck, Plus, AlertCircle, Loader2, Minus, Pencil } from 'lucide-react';

// Type cho cart structure
interface CartItem {
  food_id: number;
  quantity: number;
}

interface Cart {
  [restaurant_id: string]: CartItem[];
}

interface ReviewItem {
  review_id: number;
  user_id: number;
  rating: number;
  comment?: string | null;
  created_at: string;
  customer_name?: string;
}

// set biến riêng cho nhanh, khi lặp lại nó nhiều lần
const CLIENT_FOOD_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

/*
  ======================
  BỔ SUNG (cải thiện UI):
  ======================
  
  * Loading skeleton component
  * Error display component
*/
const FoodCardSkeleton = () => (
  <div className="flex flex-row px-4 pt-4 pb-10 rounded-lg shadow-sm bg-white animate-pulse">
    <div className="w-[120px] h-[120px] mr-4 bg-gray-200 rounded" />

    <div className="flex-1 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

const ErrorDisplay = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />

    <h3 className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</h3>
    
    <p className="text-gray-600 mb-4">
      {message}
    </p>
    
    <button onClick={onRetry} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
      Thử lại
    </button>
  </div>
);

/* 
  * component chính - quan trọng.
*/
export default function RestaurantDetailClient({ restaurantId }: { restaurantId: string }) {
  const { id } = useParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [quantities, setQuantities] = useState<{ [foodId: number]: number }>({});
  const { isAuthenticated, currentUser } = useAuth();
  /* 
    bổ sung: 3 state cải thiện UI trang bán hàng
  */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [updatingReview, setUpdatingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const currentUserId = Number((currentUser as any)?.user_id || (currentUser as any)?.id || 0);

  // fix logic tiền
  const formatPrice = (price: string | number) => {
    const parsed = typeof price === 'string' ? parseInt(price) : price;
    return isNaN(parsed) ? '0' : parsed.toLocaleString('vi-VN');
  };

  // cải thiện: data nhà hàng
  const fetchRestaurantData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const noCacheParam = `_=${Date.now()}`;

      const [restaurantRes, foodsRes] = await Promise.all([
        fetch(`${CLIENT_FOOD_URL}/api/restaurants/${id}?${noCacheParam}`, { cache: 'no-store' }),
        fetch(`${CLIENT_FOOD_URL}/api/restaurants/${id}/foods?${noCacheParam}`, { cache: 'no-store' })
      ]);

      if (!restaurantRes.ok) {
        throw new Error('Không thể tải thông tin nhà hàng');
      }

      const restaurantData = await restaurantRes.json();
      if (restaurantData.success) {
        setRestaurant(restaurantData.data);
      } else {
        throw new Error(restaurantData.message || 'Không tìm thấy nhà hàng');
      }

      if (foodsRes.ok) {
        const foodsData = await foodsRes.json();
        if (foodsData.success) {
          setFoods(foodsData.data);
        }
      }

      setLoadingFoods(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!id) return;

    try {
      setReviewLoading(true);
      const res = await fetch(`${CLIENT_FOOD_URL}/api/restaurants/${id}/reviews?limit=20&_=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data?.data?.reviews)) {
        setReviews(data.data.reviews);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantData();
    fetchReviews();
  }, [id]);

  const submitReview = async () => {
    if (!id) return;
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để gửi đánh giá.');
      return;
    }

    const userId = Number((currentUser as any)?.user_id || (currentUser as any)?.id);
    if (!userId || Number.isNaN(userId)) {
      toast.error('Không lấy được thông tin tài khoản để đánh giá.');
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await fetch(`${CLIENT_FOOD_URL}/api/restaurants/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          rating: newRating,
          comment: newComment,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        toast.error(data?.message || 'Không thể gửi đánh giá');
        return;
      }

      toast.success('Cảm ơn bạn đã gửi đánh giá!');
      setNewComment('');
      setNewRating(5);
      await Promise.all([fetchReviews(), fetchRestaurantData()]);
    } catch (err) {
      console.error('Submit review error:', err);
      toast.error('Lỗi khi gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  const startEditingReview = (review: ReviewItem) => {
    setEditingReviewId(review.review_id);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
  };

  const cancelEditingReview = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment('');
  };

  const submitReviewUpdate = async () => {
    if (!id || !editingReviewId) return;
    if (!isAuthenticated || !currentUserId) {
      toast.error('Vui lòng đăng nhập để cập nhật đánh giá.');
      return;
    }

    try {
      setUpdatingReview(true);
      const response = await fetch(`${CLIENT_FOOD_URL}/api/restaurants/${id}/reviews`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUserId,
          rating: editRating,
          comment: editComment,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        toast.error(data?.message || 'Không thể cập nhật đánh giá');
        return;
      }

      toast.success('Chỉnh sửa đánh giá thành công');
      cancelEditingReview();
      await Promise.all([fetchReviews(), fetchRestaurantData()]);
    } catch (err) {
      console.error('Update review error:', err);
      toast.error('Lỗi khi cập nhật đánh giá');
    } finally {
      setUpdatingReview(false);
    }
  };

  // Load cart data từ localStorage khi component mount (fix)
  useEffect(() => {
    if (!id) return;

    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart) as Cart;
        const restaurantId = id.toString();
        
        if (parsedCart[restaurantId]) {
          const quantityMap: { [foodId: number]: number } = {};
          parsedCart[restaurantId].forEach(item => {
            quantityMap[item.food_id] = item.quantity;
          });
          setQuantities(quantityMap);
        }
      }
    } catch (error) {
      console.error("Lỗi khi load cart:", error);
      localStorage.removeItem('cart'); // Clear corrupted data
    }
  }, [id]);
  
  // Hàm cập nhật localStorage. debounce (optional)
  const updateCartInLocalStorage = (newQuantities: { [foodId: number]: number }) => {
    if (!id) return;

    try {
      const restaurantId = id.toString();
      const savedCart = localStorage.getItem('cart');
      let cart: Cart = savedCart ? JSON.parse(savedCart) : {};

      const cartItems: CartItem[] = Object.entries(newQuantities)
        .filter(([_, quantity]) => quantity > 0)
          .map(([foodId, quantity]) => ({
            food_id: parseInt(foodId),
            quantity: quantity
          }));

      if (cartItems.length > 0) {
        cart[restaurantId] = cartItems;
      } else {
        delete cart[restaurantId];
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error("Lỗi cập nhật giỏ hàng:", error);
      toast.error('Không thể cập nhật giỏ hàng');
    }
  };

  // Cập nhật localStorage mỗi khi quantities thay đổi
  useEffect(() => {
    updateCartInLocalStorage(quantities);
  }, [quantities, id]);


  // chưa đăng nhập sẽ hiện thông báo lỗi (1 cái toast/pop-up)
  const handleAddToCart = (foodId: number) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm món vào giỏ hàng.', {
        position: 'top-center',
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
      });
      return;
    }
    setQuantities((prev) => ({
      ...prev,
      [foodId]: 1,
    }));
    // Bỏ toast notification - UI đã có feedback qua số lượng
  };

  // hàm tăng số lượng
  const increaseQuantity = (foodId: number) => {
    setQuantities((prev) => ({
      ...prev,
      [foodId]: (prev[foodId] || 0) + 1,
    }));
  };

  // hàm giảm số lượng - bỏ toast để tránh spam và đè lên cart
  const decreaseQuantity = (foodId: number) => {
    setQuantities((prev) => {
      const current = prev[foodId] || 0;
      if (current <= 1) {
        const updated = { ...prev };
        delete updated[foodId];
        return updated;
      }
      return {
        ...prev,
        [foodId]: current - 1,
      };
    });
  };

  /* 
    ===============================
    * fix: 
    * thay vì trả lại <p> cho thông báo tải thông tin nhà hàng, 
    * trả lại component Loader và nếu lỗi, trả component ErrorDisplay
    ===============================
  */
  if (loading) {
    return (
      <main className="w-full max-w-screen-2xl mx-auto py-24 lg:px-32 px-10">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-4" />
          <p className="text-gray-600">Đang tải thông tin nhà hàng...</p>
        </div>
      </main>
    );
  }
  
  if (error) {
    return (
      <main className="w-full max-w-screen-2xl mx-auto py-24 lg:px-32 px-10">
        <ErrorDisplay message={error} onRetry={fetchRestaurantData} />
      </main>
    );
  }

  if (!restaurant) return null;

  return (
    <main className="w-full max-w-screen-2xl mx-auto py-24 lg:px-32 px-10">
      <ToastContainer />
      
      {/* 
        * note: cải thiện UI cho phần 'thông tin nhà hàng'
        * thêm badge trạng thái mở/đóng cửa
      */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
        <div className="flex flex-col text-center items-center gap-8 md:flex-row md:text-left md:items-start">
          <div className="relative w-[250px] h-[200px] flex-shrink-0">
            <Image
              src={restaurant.image_url || 'https://via.placeholder.com/250x200?text=No+Image'}
              alt={restaurant.name}
              fill
              sizes="250px"
              className="object-cover rounded-xl"
              priority
            />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
              
              {restaurant.status === "active" ? (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Đang mở cửa
                </span>
              ) : (
                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                  Đã đóng cửa
                </span>
              )}
            </div>
            
            <p className="text-gray-600 leading-relaxed">{restaurant.description}</p>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-700 flex items-center gap-2">
                <MapPin className="text-red-500 flex-shrink-0" size={18} />
                <span>{restaurant.address}</span>
              </p>
              
              <p className="text-sm text-gray-700 flex items-center gap-2">
                <Phone className="text-green-500 flex-shrink-0" size={18} />
                <span>{restaurant.phone}</span>
              </p>
              
              <div className="flex items-center text-sm text-yellow-600 font-medium gap-2">
                <Star className="fill-yellow-400 text-yellow-400" size={18} />
                <span className="text-gray-900 font-semibold">
                  {parseFloat(restaurant.rating).toFixed(1)}
                </span>
                <span className="text-gray-500">
                  ({restaurant.total_reviews.toLocaleString()} đánh giá)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-16 mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Danh sách món ăn</h2>
        <span className="text-gray-600">{foods.length} món</span>
      </div>

      {/* THÊM: Loading skeleton for foods */}
      {loadingFoods ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <FoodCardSkeleton key={i} />
          ))}
        </div>
      ) : foods.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">Nhà hàng chưa có món ăn nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {foods.map((food) => (
            <div key={food.food_id} className="group">
              <div className="flex flex-row px-4 pt-4 pb-10 rounded-lg shadow-sm bg-white hover:shadow-md hover:border hover:border-green-400 transition-all duration-200 relative">
                <div className="relative w-[120px] h-[120px] mr-4 flex-shrink-0">
                  <Image
                    src={food.image_url || 'https://via.placeholder.com/120?text=No+Image'}
                    alt={food.food_name}
                    fill
                    sizes="120px"
                    className="object-cover rounded-lg"
                  />
                  
                  {/* tạm ẩn
                  {!food.is_available && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">Hết hàng</span>
                    </div>
                  )} */}
                </div>

                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-4">
                      {food.food_name}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {food.description || 'Không có mô tả'}
                    </p>
                  </div>
                  
                  <p className="text-red-500 font-bold text-lg mt-2">
                    {formatPrice(food.price)} ₫
                  </p>
                </div>

                {/* CẢI THIỆN: Better cart controls */}
                <div className="absolute bottom-3 right-3 z-10">
                  {quantities[food.food_id] ? (
                    <div className="flex items-center bg-white rounded-lg border border-none overflow-hidden">
                      <button 
                        onClick={() => decreaseQuantity(food.food_id)} 
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 transition"
                        aria-label="Giảm số lượng"
                      >
                        <Minus size={16} />
                      </button>
                      
                      <span className="px-4 py-2 font-semibold min-w-[40px] text-center">
                        {quantities[food.food_id]}
                      </span>
                      
                      <button 
                        onClick={() => increaseQuantity(food.food_id)} 
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 transition"
                        aria-label="Tăng số lượng"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(food.food_id)}
                      // disabled={!food.is_available}
                      className='p-2 rounded-full shadow-md transition transform hover:scale-110 
                        bg-green-500 hover:bg-green-600 text-white' 
                      aria-label="Thêm vào giỏ hàng"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* 
          tạm thời ẩn cái này, có vẻ overkill. 
          Thêm hiệu ứng thêm vào cart trên header có lẽ đã đủ. 
      */}
      {/* {Object.keys(quantities).length > 0 && (
        <div className="fixed bottom-6 left-6 z-50">
          <button
            onClick={() => router.push('../cart')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition"
          >
            <span>Giỏ hàng</span>
            <span className="bg-white text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              {Object.values(quantities).reduce((sum, qty) => sum + qty, 0)}
            </span>
          </button>
        </div>
      )} */}

      <section className="mt-12 bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Đánh giá từ khách hàng</h3>

        <div className="mb-6 rounded-lg border border-gray-200 p-4">
          <p className="font-semibold text-gray-800 mb-2">Gửi đánh giá của bạn</p>
          <div className="flex items-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setNewRating(star)}
                className="p-1"
              >
                <Star
                  size={20}
                  className={star <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              </button>
            ))}
          </div>

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="Chia sẻ trải nghiệm món ăn và dịch vụ..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700"
          />

          <div className="mt-3">
            <button
              type="button"
              onClick={submitReview}
              disabled={submittingReview}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </div>

        {reviewLoading ? (
          <p className="text-sm text-gray-500">Đang tải đánh giá...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có đánh giá nào cho nhà hàng này.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.review_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-800">{review.customer_name || 'Khách hàng'}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString('vi-VN')}</p>
                    {editingReviewId !== review.review_id && isAuthenticated && currentUserId > 0 && review.user_id === currentUserId && (
                      <button
                        type="button"
                        onClick={() => startEditingReview(review)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-green-200 text-green-700 transition hover:bg-green-50 hover:border-green-300"
                        title="Chỉnh sửa đánh giá"
                        aria-label="Chỉnh sửa đánh giá"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>
                </div>
                {editingReviewId === review.review_id ? (
                  <>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={`${review.review_id}-edit-${star}`}
                          type="button"
                          onClick={() => setEditRating(star)}
                          className="p-1"
                        >
                          <Star
                            size={16}
                            className={star <= editRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      rows={3}
                      maxLength={300}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700"
                    />
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={submitReviewUpdate}
                        disabled={updatingReview}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {updatingReview ? 'Đang cập nhật...' : 'Cập nhật'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditingReview}
                        disabled={updatingReview}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                      >
                        Hủy
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={`${review.review_id}-${star}`}
                          size={14}
                          className={star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{review.comment || 'Khách hàng không để lại nhận xét.'}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}