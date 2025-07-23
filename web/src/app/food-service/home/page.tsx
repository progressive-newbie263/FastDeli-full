'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FoodCategories, {Category} from '../components/FoodCategories';
import { TiTick } from "react-icons/ti";

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: number;
}

interface UserData {
  [key: string]: any;
}

const Home = () => {
  // State management
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentAddress, setCurrentAddress] = useState<string>('');

  // 3 state này (antispam) giảm thiểu việc render lại không cần thiết hoặc spam đi spam lại 1 tính năng nào đó (VD: lấy vị trí)
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);

  // 3 refs để quản lý trạng thái và tránh render lại không cần thiết
  const hasRequestedLocation = useRef<boolean>(false);
  const locationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);


  useEffect(() => {
    setIsMounted(true);
    // ktra status (đăng nhập/ đăng xuất)
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

  // dọn dẹp/ làm gọn webapp
  useEffect(() => {
    return () => {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // hàm break/ghép tọa độ thành địa chỉ
  const getAddressFromCoordinates = useCallback(async (latitude: number, longitude: number): Promise<string> => {
    try {
      // dừng các req trước.
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=vi`,{ 
        signal: abortControllerRef.current.signal,
        headers: {
          'User-Agent': 'FoodDeli/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        return data.display_name;
      }
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Address request was cancelled');
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
      
      console.error('Lỗi khi lấy địa chỉ:', error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }, []);

  // Enhanced location permission handler
  const handleLocationPermission = useCallback(async (granted: boolean) => {
    toast.dismiss();
    
    if (!granted) {
      localStorage.setItem('locationPermissionAsked', `denied:${Date.now()}`);
      return;
    }
    if (!navigator.geolocation) {
      toast.error('📍 Trình duyệt không hỗ trợ định vị');
      return;
    }
    setIsGettingLocation(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Timeout'));
        }, 10000);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeoutId);
            resolve(pos);
          },
          (error) => {
            clearTimeout(timeoutId);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });

      const { latitude, longitude } = position.coords;
      const address = await getAddressFromCoordinates(latitude, longitude);

      const locationData: LocationData = {
        latitude,
        longitude,
        address,
        timestamp: Date.now(),
      };

      localStorage.setItem('userLocation', JSON.stringify(locationData));
      localStorage.setItem('locationPermissionAsked', 'true');
      setCurrentAddress(address);
      
      const input = document.getElementById('search-input') as HTMLInputElement;
      if (input) {
        input.value = address;
      }
      
      toast.success('📍 Đã lưu vị trí của bạn!');
    } catch (error) {
      console.error('Lỗi vị trí:', error);
      localStorage.setItem('locationPermissionAsked', `denied:${Date.now()}`);
      
      let errorMessage = 'Không thể lấy vị trí của bạn';
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Bạn đã từ chối chia sẻ vị trí';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Thông tin vị trí không khả dụng';
            break;
          case error.TIMEOUT:
            errorMessage = 'Hết thời gian chờ lấy vị trí';
            break;
        }
      }
      
      toast.error(`📍 ${errorMessage}`);
    } finally {
      setIsGettingLocation(false);
    }
  }, [getAddressFromCoordinates]);


  // Hàm điền địa chỉ hiện tại vào input
  // chỉ khi xác nhận người dùng đã "cho phép" lấy địa chỉ thì mới được lấy.
  const fillCurrentLocation = useCallback(async () => {
    if (!isMounted || !isLoggedIn) return;
    
    if (!navigator.geolocation) {
      toast.error('📍Trình duyệt không hỗ trợ định vị');
      return;
    }

    if (isGettingLocation) {
      toast.info('📍Đang lấy vị trí, vui lòng đợi...');
      return;
    }

    const askStatus = localStorage.getItem('locationPermissionAsked');
    
    /* 
      Khi người dùng nhập 'từ chối'. Có thể họ lỡ tay bấm nhầm? 
      Nên khi muốn lấy địa chỉ, ta nên hỏi lại người dùng có muốn cho phép hay không.
      confirm thì mới lấy địa chỉ.
    */
    if (!askStatus || askStatus !== 'true') {
      const wasDenied = askStatus?.startsWith('denied:');
      
      toast.info(
        <div>
          📍{wasDenied ? 'Bạn có muốn cho phép FoodDeli truy cập vị trí để tự động điền địa chỉ?' : 'FoodDeli muốn sử dụng vị trí hiện tại của bạn để tự động điền địa chỉ.'}<br />
          {wasDenied && (
            <small className="text-gray-600">
              (Bạn có thể thay đổi quyết định trước đó)
            </small>
          )}

          <div className="mt-2 flex gap-4 justify-end">
            <button
              onClick={() => handleLocationPermission(true)}
              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm transition-colors"
              aria-label="Cho phép truy cập vị trí"
            >
              Cho phép
            </button>

            <button
              onClick={() => handleLocationPermission(false)}
              className="px-3 py-1 bg-gray-300 text-black rounded-md hover:bg-gray-400 text-sm transition-colors"
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
        }
      );
      return;
    }
    // qua các bước phía trên thì ở đây đã có quyền truy cập vị trí, nên lấy địa chỉ hiện tại
    // OSM/ OpenStreetMap API là chủ đạo cho tính năng này.
    await handleLocationPermission(true);
  }, [isMounted, isLoggedIn, isGettingLocation, handleLocationPermission]);

  /* 
    ****** Popup yêu cầu vị trí người dùng sẽ hiển thị lần đầu khi người dùng đăng nhập. ******
    ****** Thường đăng nhập xong thì vị trí người dùng lưu trong localStorage rồi. ******
    
    ****** Kiểm tra khi đăng nhập thành công ******
    - Lần đầu đăng nhập xong hoặc mới xóa các value trong localStorage
    - Sẽ hiển thị tin nhắn hỏi "Có cho phép lấy địa chỉ người dùng?"
    - nếu không cho / nhấn cancel thì thôi. Sẽ có 1 vài giới hạn được áp đặt lên
    - Nếu cho / nhấn allow thì localStorage sẽ nhận được 1 cái 'userPermission' là true
    ở những lần đăng nhập tiếp theo thì cứ từ đó mà triển. 

    - Đảm bảo đầy đủ cả 3 yêu cầu: isMounted, isLoggedIn và hasRequestedLocation thì nút bấm lấy
    địa chỉ mới dùng được hoàn chỉnh.
  */

  useEffect(() => {
    if (isMounted && isLoggedIn && !hasRequestedLocation.current) {
      const savedLocation = localStorage.getItem('userLocation');
      const askStatus = localStorage.getItem('locationPermissionAsked');

      if (!savedLocation) {
        let shouldAsk = false;

        if (!askStatus) {
          shouldAsk = true;
        } 
        else if (askStatus.startsWith('denied:')) {
          // câu hỏi "muốn được lấy địa chỉ không?" sẽ có cooldown 3 ngày.
          // Người dùng nhất quyết ko cho thì 3 ngày sau mới hỏi lại, tránh người dùng bị làm phiền khi hiển thị lại popup này.
          const [, timestampStr] = askStatus.split(':');
          const deniedTime = parseInt(timestampStr, 10);
          const now = Date.now();
          const daysPassed = (now - deniedTime) / (1000 * 60 * 60 * 24);

          if (daysPassed >= 3) {
            shouldAsk = true;
          }
        }

        if (shouldAsk) {
          hasRequestedLocation.current = true;

          locationTimeoutRef.current = setTimeout(() => {
            toast.info(
              <div>
                📍 FoodDeli muốn sử dụng vị trí hiện tại của bạn để gợi ý nhà hàng gần nhất.<br/>
                <small className="text-gray-600">
                  (Bạn luôn có thể thay đổi quyết định bằng cách bấm vào biểu tượng định vị)
                </small>

                <div className="mt-2 flex gap-4 justify-end">
                  <button
                    onClick={() => handleLocationPermission(true)}
                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm transition-colors"
                    aria-label="Cho phép truy cập vị trí"
                  >
                    Cho phép
                  </button>

                  <button
                    onClick={() => handleLocationPermission(false)}
                    className="px-3 py-1 bg-gray-300 text-black rounded-md hover:bg-gray-400 text-sm transition-colors"
                    aria-label="Từ chối truy cập vị trí"
                  >
                    Từ chối
                  </button>
                </div>
              </div>,
              {
                autoClose: false,
                closeOnClick: false,
                closeButton: false
              }
            );    
          }, 1000);
        }
      }
    }
  }, [isMounted, isLoggedIn, handleLocationPermission]);


  // useEffect để lấy danh sách thể loại món ăn từ API (vd: cơm, mì, ...)
  useEffect(() => {
    if (!isMounted) return;

    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      
      try {
        const response = await fetch('http://localhost:5001/api/categories', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
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


  // Nút tìm kiếm nhà hàng
  // tạm thời chưa làm cái encodeURIComponent cho query, vì chưa viết API tìm kiếm từng nhà hàng.
  const handleSearch = useCallback(() => {
    const input = document.getElementById('search-input') as HTMLInputElement | null;
    const query = input?.value.trim() || '';

    if (query === '') {
      window.location.href = '/food-service/restaurants';
    } else {
      window.location.href = `/food-service/restaurants?search=${encodeURIComponent(query)}`;
    }
  }, []);


  // thêm keypress: enter để tìm kiếm, thay vì chỉ bấm chuột vào nút tìm kiếm.
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);


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
              <p className="text-lg md:text-xl mb-2 text-gray-700">
                Good Afternoon
              </p>
              
              <h1 className="text-4xl font-bold mb-8 text-gray-900">
                Where should we deliver your food today?
              </h1>
              
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" aria-hidden="true"></div>
                  </div>

                  {/* thanh input. Chỉ dùng cho người đã đăng nhập. Bao gồm cả nút tự động lấy địa chỉ người dùng */}
                  <input 
                    type="text"
                    id="search-input" 
                    placeholder={isLoggedIn ? "Nhập địa chỉ của bạn" : "Đăng nhập để tìm địa chỉ"}
                    className={`w-full pl-10 pr-12 py-4 border rounded-lg text-sm transition-colors
                      ${isLoggedIn 
                        ? 'border-gray-300 cursor-text focus:border-orange-500 focus:ring-2 focus:ring-orange-200' 
                        : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'}`
                    }
                    disabled={!isLoggedIn}
                    onKeyPress={handleKeyPress}
                    aria-label="Địa chỉ giao hàng"
                  />

                  <button
                    onClick={fillCurrentLocation}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all duration-250 
                      ${isLoggedIn ? 'hover:bg-gray-100 cursor-pointer focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-200' : 'cursor-not-allowed opacity-50'}`
                    }
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
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 focus:bg-orange-600 text-white rounded-lg font-semibold text-lg transition-colors mb-2 
                  cursor-pointer duration-250 focus:outline-none focus:ring-2 focus:ring-orange-200"
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
      <section className="py-16 max-w-[1200px] mx-auto px-4 text-center text-black bg-white mt-[80px]">
        <h2 className="text-3xl font-bold">Featured</h2>
      </section>


      {/* Food categories section (THỂ LOẠI món ăn - mì, cơm, ...) */}
      <section className="py-16 max-w-[1200px] mx-auto px-4 text-black bg-white mt-[80px]">
        {isLoadingCategories ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách thể loại...</p>
          </div>
        ) : (
          <FoodCategories categories={categories}/>
        )}
      </section>


      {/* Info section (thêm chút thông tin cho webapp này, text clone chém gió là chính) */}
      <section className="py-16 max-w-[1200px] mx-auto px-4 text-black bg-white mt-[80px]">
        <h2 className='text-4xl font-bold mb-12'>Tiện ích của FoodDeli</h2>

        <ul className="space-y-4" role="list">
          <li className="flex items-start" role="listitem">
            <TiTick className="text-green-500 mt-1 mr-3 flex-shrink-0" aria-hidden="true" />
            <span><strong>Giao đồ thần tốc</strong> - FoodDeli mang đến dịch vụ giao đồ ăn nhanh nhất thị trường.</span>
          </li>

          <li className="flex items-start" role="listitem">
            <TiTick className="text-green-500 mt-1 mr-3 flex-shrink-0" aria-hidden="true" />
            <span><strong>Thân thiện và tiện lợi để sử dụng</strong> - Việc đặt món giờ đây chỉ cần vài cú nhấp hoặc chạm, để có trải nghiệm nhanh chóng, đầy đủ và tiện ích.</span>
          </li>
          
          <li className="flex items-start" role="listitem">
            <TiTick className="text-green-500 mt-1 mr-3 flex-shrink-0" aria-hidden="true" />
            <span><strong>Thỏa mãn mọi khẩu vị của người dùng</strong> - Từ món ăn đường phố đến các nhà hàng chất lượng nhất, đáp ứng mọi khẩu vị từ quý khách.</span>
          </li>
          
          <li className="flex items-start" role="listitem">
            <TiTick className="text-green-500 mt-1 mr-3 flex-shrink-0" aria-hidden="true" />
            <span><strong>Hệ thống tích điểm thưởng riêng</strong> - Nhận điểm tích lũy cho mỗi đơn hàng và đổi lấy nhiều phần quà và ưu đãi hấp dẫn.</span>
          </li>
        </ul>
      </section>


      {/* Call to action section (Cơ bản 1 cái section kích cầu) */}
      <section className="py-16 max-w-[1200px] mx-auto px-4 text-center text-black bg-white mt-[200px]">
        {!isLoggedIn ? (
          <>
            <h2 className="text-3xl font-bold mb-6">
              Trải nghiệm dịch vụ hàng đầu chỉ với một thao tác đăng nhập
            </h2>
          
            <p className="text-lg text-gray-700 mb-8">
              Sử dụng mọi dịch vụ hàng đầu từ những nhà hàng xuất sắc nhất từ phía chúng tôi với ưu đãi rẻ nhất
            </p>

            <Link
              href="/food-service/auth/register"
              className="inline-block px-8 py-4 bg-orange-500 text-white rounded-lg text-xl font-semibold hover:bg-orange-600 focus:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-200"
              aria-label="Đăng ký tài khoản miễn phí"
            >
              Đăng ký miễn phí
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-6">Đặt món ăn ngay</h2>
          
            <p className="text-lg text-gray-700 mb-8">
              Bắt đầu trải nghiệm dịch vụ giao đồ ăn nhanh chóng, tiện lợi ngay hôm nay.
            </p>

            <Link
              href="/food-service/restaurants"
              className="inline-block px-8 py-4 bg-orange-500 text-white rounded-lg text-xl font-semibold hover:bg-orange-600 focus:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-200"
              aria-label="Khám phá các nhà hàng"
            >
              Khám phá nhà hàng
            </Link>
          </>
        )}
      </section>
    </div>
  );
};

export default Home;