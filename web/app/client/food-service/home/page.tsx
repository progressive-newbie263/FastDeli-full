'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FoodCategories, {Category} from '../components/FoodCategories';
import { Check } from "lucide-react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClientLink from '../components/ClientLink';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: number;
}

interface UserData {
  [key: string]: any;
}

interface FeaturedFood {
  food_id: number;
  food_name: string;
  image_url?: string | null;
  restaurant_id: number;
  restaurant_name: string;
}

interface FeaturedRestaurantGroup {
  restaurant_id: number;
  restaurant_name: string;
  featured_foods: FeaturedFood[];
  cover_image: string | null;
}

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [featuredRestaurants, setFeaturedRestaurants] = useState<FeaturedRestaurantGroup[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState<boolean>(false);
  const isPermissionToastShowing = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // hiển thị xoay tua/băng chuyền cho section "thức ăn nổi bật"
  const [carouselStart, setCarouselStart] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hiển thị toast thông báo redirect từ trang khác
  useEffect(() => {
    const message = localStorage.getItem("toastMessage");
    if (message) {
      toast.info(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      localStorage.removeItem("toastMessage");
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('userData');
    setIsLoggedIn(!!token);
    setUserData(userDataStr ? JSON.parse(userDataStr) : {});

    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const locationData: LocationData = JSON.parse(savedLocation);
        setCurrentAddress(locationData.address);
      } catch (error) {
        console.error('Error parsing saved location:', error);
        localStorage.removeItem('userLocation');
      }
    }

    document.title = 'FoodDeli - Đặt đồ ăn trực tuyến';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const getAddressFromCoordinates = useCallback(async (latitude: number, longitude: number): Promise<string> => {
    try {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=vi`,{
        signal: abortControllerRef.current.signal,
        headers: { 'User-Agent': 'FoodDeli/1.0' }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data && data.display_name) return data.display_name;
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Address request was cancelled');
      }
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }, []);

  const handleLocationPermission = useCallback(async (granted: boolean) => {
    toast.dismiss();
    isPermissionToastShowing.current = false;

    if (!granted) {
      localStorage.setItem('locationPermissionAsked', `denied:${Date.now()}`);
      return;
    }

    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị');
      return;
    }

    setIsGettingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Timeout'));
        }, 15000);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeoutId);
            resolve(pos);
          },
          (error) => {
            if (error.code === error.POSITION_UNAVAILABLE) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  clearTimeout(timeoutId);
                  resolve(pos);
                },
                (retryError) => {
                  clearTimeout(timeoutId);
                  reject(retryError);
                },
                { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }
              );
            } else {
              clearTimeout(timeoutId);
              reject(error);
            }
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      });

      const { latitude, longitude } = position.coords;
      const address = await getAddressFromCoordinates(latitude, longitude);
      const locationData: LocationData = { latitude, longitude, address, timestamp: Date.now() };
      localStorage.setItem('userLocation', JSON.stringify(locationData));
      localStorage.setItem('locationPermissionAsked', 'true');
      setCurrentAddress(address);
      window.dispatchEvent(new Event('user-location-updated'));
      const input = document.getElementById('search-input') as HTMLInputElement;
      if (input) { input.value = address; }
      toast.success('Đã lưu vị trí của bạn!');
    } catch (error) {
      console.error('Lỗi vị trí:', error);
      const savedLocation = localStorage.getItem('userLocation');
      if (savedLocation) {
        try {
          const parsed: LocationData = JSON.parse(savedLocation);
          if (parsed?.address) {
            setCurrentAddress(parsed.address);
            const input = document.getElementById('search-input') as HTMLInputElement;
            if (input) { input.value = parsed.address; }
          }
        } catch (parseError) {
          console.error('Lỗi parse userLocation fallback:', parseError);
        }
      }

      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            localStorage.setItem('locationPermissionAsked', `denied:${Date.now()}`);
            toast.error(
              <div>
                <p className="font-bold text-base mb-1">
                  Bạn đã từ chối quyền truy cập vị trí. Vui lòng mở lại quyền để cho phép sử dụng tính năng này.
                </p>
                <ol className="list-decimal ml-4 space-y-1 text-sm ">
                  <li>Nhấn vào biểu tượng ổ khóa ở thanh địa chỉ.</li>
                  <li>Chọn "Quyền" hoặc "Vị trí".</li>
                  <li>Đổi từ "Chặn" sang "Cho phép".</li>
                  <li>Tải lại trang hoặc bấm F5.</li>
                </ol>
              </div>,
              { icon: false }
            );
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Không thể xác định vị trí của bạn. Vui lòng thử lại.");
            break;
          case error.TIMEOUT:
            toast.error("Hết thời gian chờ lấy vị trí. Vui lòng thử lại.");
            break;
          default:
            toast.error("Đã xảy ra lỗi không xác định.");
            break;
        }
      }
      if (error instanceof Error && error.message === 'Timeout') {
        toast.error('Hết thời gian lấy vị trí. Hệ thống sẽ dùng địa chỉ đã lưu gần nhất nếu có.');
      }
    } finally {
      setIsGettingLocation(false);
    }
  }, [getAddressFromCoordinates]);

  const fillCurrentLocation = useCallback(async () => {
    if (!isMounted || !isLoggedIn) return;
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị');
      return;
    }
    if (isGettingLocation) {
      toast.info('Đang lấy vị trí, vui lòng đợi...');
      return;
    }

    const savedLocationRaw = localStorage.getItem('userLocation');
    if (savedLocationRaw) {
      try {
        const savedLocation: Partial<LocationData> = JSON.parse(savedLocationRaw);
        const isFresh = typeof savedLocation.timestamp === 'number' &&
          (Date.now() - savedLocation.timestamp) < 5 * 60 * 1000;
        if (isFresh && typeof savedLocation.address === 'string' && savedLocation.address.trim().length > 0) {
          setCurrentAddress(savedLocation.address);
          const input = document.getElementById('search-input') as HTMLInputElement;
          if (input) { input.value = savedLocation.address; }
          toast.info('Đang dùng địa chỉ đã cập nhật gần nhất.');
          return;
        }
      } catch (error) {
        console.error('Lỗi parse userLocation trong fillCurrentLocation:', error);
      }
    }

    if (isPermissionToastShowing.current) { return; }

    const askStatus = localStorage.getItem('locationPermissionAsked');
    if (!askStatus || askStatus !== 'true') {
      const wasDenied = askStatus?.startsWith('denied:');
      isPermissionToastShowing.current = true;
      const toastId = toast.info(
        <div>
          {wasDenied
            ? 'Bạn có muốn cho phép FoodDeli truy cập vị trí để tự động điền địa chỉ?'
            : 'FoodDeli muốn sử dụng vị trí hiện tại của bạn để tự động điền địa chỉ.'}
          <br />
          {wasDenied && (
            <small className="text-gray-600">(Bạn có thể thay đổi quyết định trước đó)</small>
          )}
          <div className="mt-2 flex gap-4 justify-center">
            <button
              onClick={() => {
                isPermissionToastShowing.current = false;
                toast.dismiss(toastId);
                handleLocationPermission(true);
              }}
              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm transition-colors cursor-pointer duration-150"
              aria-label="Cho phép truy cập vị trí"
            >
              Cho phép
            </button>
            <button
              onClick={() => {
                isPermissionToastShowing.current = false;
                toast.dismiss(toastId);
                handleLocationPermission(false);
              }}
              className="px-3 py-1 bg-gray-300 text-black rounded-md hover:bg-gray-400 text-sm transition-colors cursor-pointer duration-150"
              aria-label="Từ chối truy cập vị trí"
            >
              Từ chối
            </button>
          </div>
        </div>,
        {
          autoClose: false,
          closeOnClick: false,
          closeButton: false,
          icon: false,
          onClose: () => { isPermissionToastShowing.current = false; }
        }
      );
      return;
    }

    await handleLocationPermission(true);
  }, [isMounted, isLoggedIn, isGettingLocation, handleLocationPermission]);

  useEffect(() => {
    if (!isMounted) return;
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await fetch('http://localhost:5001/api/categories', {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          console.warn('Invalid categories data structure:', data);
          setCategories([]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error('Không thể tải danh sách thể loại món ăn');
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const fetchFeaturedFoods = async () => {
      setIsLoadingFeatured(true);
      try {
        const response = await fetch('http://localhost:5001/api/foods?is_featured=true&limit=24', {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const foods: FeaturedFood[] = Array.isArray(data?.data?.foods) ? data.data.foods : [];

        const groupedByRestaurant = new Map<number, FeaturedRestaurantGroup>();
        foods.forEach((food) => {
          if (!food?.restaurant_id || !food?.restaurant_name) return;
          const existing = groupedByRestaurant.get(food.restaurant_id);
          if (existing) {
            existing.featured_foods.push(food);
            return;
          }
          groupedByRestaurant.set(food.restaurant_id, {
            restaurant_id: food.restaurant_id,
            restaurant_name: food.restaurant_name,
            featured_foods: [food],
            cover_image: food.image_url || null,
          });
        });

        setFeaturedRestaurants(Array.from(groupedByRestaurant.values()).slice(0, 8));
      } catch (error) {
        console.error('Failed to fetch featured foods:', error);
        setFeaturedRestaurants([]);
      } finally {
        setIsLoadingFeatured(false);
      }
    };
    fetchFeaturedFoods();
  }, [isMounted]);

  const handleSearch = useCallback(() => {
    const input = document.getElementById('search-input') as HTMLInputElement | null;
    const query = input?.value.trim() || '';
    const savedLocation = localStorage.getItem('userLocation');
    let savedAddress = '';
    try {
      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);
        savedAddress = String(parsed?.address || '').trim();
      }
    } catch (error) {
      console.error('Không parse được userLocation khi tìm kiếm:', error);
    }

    const shouldUseNearby =
      query === '' ||
      (savedAddress.length > 0 && query.toLowerCase() === savedAddress.toLowerCase()) ||
      (currentAddress.length > 0 && query.toLowerCase() === currentAddress.toLowerCase());

    if (shouldUseNearby) {
      window.location.href = '/client/food-service/restaurants?nearby=1';
    } else {
      window.location.href = `/client/food-service/restaurants?search=${encodeURIComponent(query)}`;
    }
  }, [currentAddress]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') { handleSearch(); }
  }, [handleSearch]);

  /* code hỗ trợ làm xoay tua cho "nhà hàng nổi bật" */
  const total = featuredRestaurants.length;
  const visibleCount = 4;
  const extendedList = total > 0
    ? [
        ...featuredRestaurants.slice(-visibleCount),
        ...featuredRestaurants,
        ...featuredRestaurants.slice(0, visibleCount),
      ]
    : [];

  const handleNext = () => { setCarouselStart((prev) => prev + 1); };
  const handlePrev = () => { setCarouselStart((prev) => prev - 1); };

  useEffect(() => {
    if (total <= visibleCount) return;
    intervalRef.current = setInterval(() => {
      setCarouselStart((prev) => prev + 1);
    }, 10000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [total]);

  useEffect(() => {
    if (total === 0) return;
    if (carouselStart >= total + visibleCount) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCarouselStart(visibleCount);
      }, 300);
    }
    if (carouselStart <= 0) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCarouselStart(total);
      }, 300);
    }
  }, [carouselStart, total]);

  useEffect(() => {
    if (!isTransitioning) {
      requestAnimationFrame(() => { setIsTransitioning(true); });
    }
  }, [isTransitioning]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header section + ảnh món ăn đại diện */}
      <div className="relative h-[400px]">
        <div
          className="absolute inset-0 opacity-60 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("https://food-cms.grab.com/compressed_webp/cuisine/144/icons/Rice_e191965ccd6848a3862e6a695d05983f_1547819238893335910.webp")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          role="img"
          aria-label="Food background image"
        />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full mt-[200px]">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full md:w-[350px]">
              <p className="text-lg md:text-xl mb-2 text-gray-700">Một ngày mới vui vẻ!</p>
              <h1 className="text-4xl font-bold mb-8 text-gray-900">
                Hôm nay bạn muốn giao đồ ăn tới đâu?
              </h1>
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <button
                      onClick={() => setIsMapOpen(true)}
                      className="text-white rounded-lg hover:bg-gray-100 cursor-pointer transition"
                      title={isLoggedIn ? 'Bản đồ' : 'Vui lòng đăng nhập'}
                    >
                      🗺️
                    </button>
                  </div>
                  <input
                    type="text"
                    id="search-input"
                    placeholder={isLoggedIn ? "Nhập địa chỉ của bạn" : "Đăng nhập để tìm địa chỉ"}
                    className={`w-full pl-10 pr-12 py-4 border rounded-lg text-sm transition-colors ${
                      isLoggedIn
                        ? 'border-gray-300 cursor-text '
                        : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!isLoggedIn}
                    onKeyPress={handleKeyPress}
                    aria-label="Địa chỉ giao hàng"
                  />
                  <button
                    onClick={fillCurrentLocation}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all duration-250 ${
                      isLoggedIn
                        ? 'hover:bg-gray-100 cursor-pointer focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-200'
                        : 'cursor-not-allowed opacity-50'
                    }`}
                    disabled={!isLoggedIn || isGettingLocation}
                    title={isLoggedIn ? 'Sử dụng vị trí hiện tại' : 'Vui lòng đăng nhập'}
                    aria-label="Sử dụng vị trí hiện tại"
                  >
                    {isGettingLocation ? (
                      <svg className="animate-spin h-5 w-5 text-green-500" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 focus:bg-orange-600 text-white rounded-lg font-semibold text-lg transition-colors mb-2 cursor-pointer duration-250 focus:outline-none focus:ring-2 focus:ring-orange-200"
                aria-label="Tìm kiếm nhà hàng"
              >
                Tìm kiếm nhà hàng
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* thanh chia section */}
      <div className='bg-gray-200 h-[2px] mt-[60px]' role="separator" aria-hidden="true"></div>

      {/* Featured section (món ăn mới/ đề xuất) */}
      <section className="py-16 max-w-[1200px] mx-auto px-4 text-black bg-white mt-[80px]">
        <h2 className="text-3xl font-bold mb-6">Món ngon trong tuần</h2>

        {isLoadingFeatured ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-3 text-gray-600">Đang tải featured...</p>
          </div>
        ) : total === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-600">
            Chưa có món featured nào. Admin có thể bật featured cho món ăn để hiển thị tại đây.
          </div>
        ) : (
          // ---- FIX 1: wrapper relative để đặt nút hai bên ----
          // ---- FIX 2: px-12 để tạo chỗ cho nút, overflow-hidden ẩn card bên ngoài ----
          <div className="relative px-12">

            {/* Nút Trái — cạnh trái của section */}
            {total > visibleCount && (
              <button
                onClick={handlePrev}
                className="absolute -left-9 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-gray-200 
                bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors
                "
                aria-label="Trước"
              >
                <ChevronLeft />
              </button>
            )}

            {/* Nút Phải — cạnh phải của section */}
            {total > visibleCount && (
              <button
                onClick={handleNext}
                className="absolute -right-9 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-gray-200 
                bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors
                "
                aria-label="Sau"
              >
                <ChevronRight />
              </button>
            )}

            {/* overflow-hidden trực tiếp bọc track — đảm bảo card hai bên bị ẩn hoàn toàn */}
            <div className="overflow-hidden">
              <div
                className={isTransitioning ? "transition-transform duration-300 ease-in-out" : ""}
                style={{
                  display: 'flex',
                  gap: '20px',
                  transform: `translateX(calc(${carouselStart} * (-25% - 5px)))`,
                }}
              >
                {extendedList.map((restaurant, index) => (
                  <div
                    key={index}
                    style={{ flex: '0 0 calc(25% - 15px)', minWidth: 0 }}
                  >
                    <ClientLink
                      href={`/restaurants/${restaurant.restaurant_id}`}
                      className="group flex flex-col h-full rounded-2xl border border-gray-200 overflow-hidden bg-white hover:shadow-lg transition-shadow"
                    >
                      <div className="h-36 bg-gray-100 overflow-hidden flex-shrink-0">
                        <img
                          src={restaurant.cover_image || "/assets/food-images/intro-1.png"}
                          alt={restaurant.restaurant_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-semibold text-base text-gray-900 line-clamp-1">
                          {restaurant.restaurant_name}
                        </h3>

                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {restaurant.featured_foods.length} món đang được đề xuất
                        </p>

                        <ul className="mt-3 space-y-1 text-xs text-gray-600">
                          {Array.from({ length: 3 }).map((_, i) => {
                            const food = restaurant.featured_foods[i];
                            return (
                              <li
                                key={i}
                                className="truncate"
                                style={{ height: '1.2rem', lineHeight: '1.2rem' }}
                              >
                                {food ? `• ${food.food_name}` : '\u00A0'}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </ClientLink>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Food categories section (THỂ LOẠI món ăn - mì, cơm, ...) */}
      <section className="py-16 max-w-[1200px] mx-auto px-4 text-black bg-white mt-[80px]">
        {isLoadingCategories ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách thể loại...</p>
          </div>
        ) : (
          <FoodCategories categories={categories} />
        )}
      </section>

      {/* Info section */}
      <section className="py-16 max-w-[1200px] mx-auto px-4 text-black bg-white mt-[80px]">
        <h2 className='text-4xl font-bold mb-12'>Tiện ích của FoodDeli</h2>

        <ul className="space-y-4" role="list">
          <li className="flex items-start" role="listitem">
            <Check className="text-green-500 mt-1 mr-3 flex-shrink-0" aria-hidden="true" />
            <span><strong>Giao đồ thần tốc</strong> - FoodDeli mang đến dịch vụ giao đồ ăn nhanh nhất thị trường.</span>
          </li>

          <li className="flex items-start" role="listitem">
            <Check className="text-green-500 mt-1 mr-3 flex-shrink-0" aria-hidden="true" />
            <span><strong>Thân thiện và tiện lợi để sử dụng</strong> - Việc đặt món giờ đây chỉ cần vài cú nhấp hoặc chạm, để có trải nghiệm nhanh chóng, đầy đủ và tiện ích.</span>
          </li>
          
          <li className="flex items-start" role="listitem">
            <Check className="text-green-500 mt-1 mr-3 flex-shrink-0" aria-hidden="true" />
            <span><strong>Thỏa mãn mọi khẩu vị của người dùng</strong> - Từ món ăn đường phố đến các nhà hàng chất lượng nhất, đáp ứng mọi khẩu vị từ quý khách.</span>
          </li>
          
          <li className="flex items-start" role="listitem">
            <Check className="text-green-500 mt-1 mr-3 flex-shrink-0" aria-hidden="true" />
            <span><strong>Hệ thống tích điểm thưởng riêng</strong> - Nhận điểm tích lũy cho mỗi đơn hàng và đổi lấy nhiều phần quà và ưu đãi hấp dẫn.</span>
          </li>
        </ul>
      </section>

      {/* Call to action section */}
      <section className="py-16 max-w-[1200px] mx-auto px-4 text-center text-black bg-white mt-[200px]">
        {!isLoggedIn ? (
          <>
            <h2 className="text-3xl font-bold mb-6">
              Trải nghiệm dịch vụ hàng đầu chỉ với một thao tác đăng nhập
            </h2>
            
            <p className="text-lg text-gray-700 mb-8">
              Sử dụng mọi dịch vụ hàng đầu từ những nhà hàng xuất sắc nhất từ phía chúng tôi với ưu đãi rẻ nhất
            </p>
            
            <ClientLink
              href="/auth/register"
              className="inline-block px-8 py-4 bg-orange-500 text-white rounded-lg text-xl font-semibold hover:bg-orange-600 focus:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-200"
              aria-label="Đăng ký tài khoản miễn phí"
            >
              Đăng ký miễn phí
            </ClientLink>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-6">Đặt món ăn ngay</h2>
            
            <p className="text-lg text-gray-700 mb-8">
              Bắt đầu trải nghiệm dịch vụ giao đồ ăn nhanh chóng, tiện lợi ngay hôm nay.
            </p>
            
            <ClientLink
              href="/restaurants"
              className="inline-block px-8 py-4 bg-orange-500 text-white rounded-lg text-xl font-semibold hover:bg-orange-600 focus:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-200"
              aria-label="Khám phá các nhà hàng"
            >
              Khám phá nhà hàng
            </ClientLink>
          </>
        )}
      </section>
    </div>
  );
};

export default Home;