import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Định nghĩa interface cho form data
interface FormData {
  email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
  full_name: string;
  gender: string;
  date_of_birth: string;
}

// Định nghĩa interface cho errors
interface FormErrors {
  email?: string;
  phone_number?: string;
  password?: string;
  confirm_password?: string;
  full_name?: string;
  gender?: string;
  date_of_birth?: string;
  server?: string;
}

// Định nghĩa interface cho register data (không có confirm_password)
interface RegisterData {
  email: string;
  phone_number: string;
  password: string;
  full_name: string;
  gender: string;
  date_of_birth: string;
  avatar_url: string;
}

const RegisterForm = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    full_name: '',
    gender: '',
    date_of_birth: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const router = useRouter();

  // Ensure component is mounted before using router
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing in that field
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Email validation
    if (!formData.email) newErrors.email = 'Email không được để trống';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
    
    // Phone validation
    if (!formData.phone_number) newErrors.phone_number = 'Số điện thoại không được để trống';
    else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(formData.phone_number)) 
      newErrors.phone_number = 'Số điện thoại không hợp lệ';
    
    // Password validation
    if (!formData.password) newErrors.password = 'Mật khẩu không được để trống';
    else if (formData.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    
    // Confirm password
    if (!formData.confirm_password) newErrors.confirm_password = 'Vui lòng xác nhận mật khẩu';
    else if (formData.password !== formData.confirm_password) 
      newErrors.confirm_password = 'Mật khẩu xác nhận không khớp';
    
    // Full name
    if (!formData.full_name) newErrors.full_name = 'Họ tên không được để trống';
    
    // Gender
    if (!formData.gender) newErrors.gender = 'Vui lòng chọn giới tính';
    
    // Date of birth
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Ngày sinh không được để trống';
    else {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18) newErrors.date_of_birth = 'Bạn phải từ 18 tuổi trở lên';
      else if (age > 100) newErrors.date_of_birth = 'Ngày sinh không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm() || !mounted) return;
    
    // Prepare data to send (remove confirm_password)
    const { confirm_password, ...registerData } = formData;
    
    // Add default avatar
    const dataToSend: RegisterData = {
      ...registerData,
      avatar_url: 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
    };
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', dataToSend);
      
      // Hiển thị thông báo thành công
      if (typeof window !== 'undefined') {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
      }
      
      // Only redirect if router is ready and mounted
      
      await router.push('/food-service/auth/login');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response && error.response.data) {
        // Handle specific errors
        if (error.response.data.field) {
          setErrors({
            ...errors,
            [error.response.data.field]: error.response.data.message
          });
        } else {
          setErrors({
            ...errors,
            server: error.response.data.message || 'Đăng ký thất bại. Vui lòng thử lại.'
          });
        }
      } else {
        setErrors({
          ...errors,
          server: 'Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't render until component is mounted
  if (!mounted) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>

          <div className="h-10 bg-gray-200 rounded mt-4 mb-4"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
      <h2 className="text-3xl font-bold mb-6 text-black">Đăng ký tài khoản</h2>
      
      {errors.server && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errors.server}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-2">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email <span className="text-red-500">*</span>
            </label>

            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
              }`}
              placeholder="Nhập email của bạn"
            />

            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          
          <div className="mb-2">
            <label htmlFor="phone_number" className="block text-gray-700 font-medium mb-2">
              Số điện thoại <span className="text-red-500">*</span>
            </label>

            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.phone_number ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
              }`}
              placeholder="VD: 0901234567"
            />
            {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
          </div>
        </div>

        <div className="mb-2">
          <label htmlFor="full_name" className="block text-gray-700 font-medium mb-2">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.full_name ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
            }`}
            placeholder="Nhập họ và tên đầy đủ"
          />
          {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-2">
            <label htmlFor="gender" className="block text-gray-700 font-medium mb-2">
              Giới tính <span className="text-red-500">*</span>
            </label>

            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.gender ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
              }`}
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </div>
          
          <div className="mb-2">
            <label htmlFor="date_of_birth" className="block text-gray-700 font-medium mb-2">
              Ngày sinh <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.date_of_birth ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
              }`}
            />
            {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-2">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.password ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
              }`}
              placeholder="Tối thiểu 6 ký tự"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirm_password" className="block text-gray-700 font-medium mb-2">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.confirm_password ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
              }`}
              placeholder="Nhập lại mật khẩu"
            />
            {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || !mounted}
          className="w-full bg-yellow-300 text-gray-600 py-2 px-4 rounded-full hover:bg-yellow-400
            focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-orange-300
            cursor-pointer duration-300
          "
        >
          {loading ? 'Đang xử lý...' : 'Đăng Ký'}
        </button>
      </form>
      
      <div className="mt-6 text-center text-gray-600 text-sm">
        Đã có tài khoản?{' '}
        <Link href="/food-service/auth/login" className="text-blue-800 hover:underline font-medium">
          Đăng nhập ngay
        </Link>
      </div>
      
      <div className="mt-4 text-center text-gray-500 text-xs">
        Bằng việc đăng ký, bạn đã đồng ý với các{' '}
        <a href="#" className="text-blue-800 hover:underline">Điều khoản dịch vụ</a>
        {' '}và{' '}
        <a href="#" className="text-blue-800 hover:underline">Chính sách bảo mật</a>
        {' '}của chúng tôi.
      </div>
    </div>
  );
};

export default RegisterForm;