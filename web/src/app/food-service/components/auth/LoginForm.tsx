import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@food/context/AuthContext';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  server?: string;
}

const LoginForm = () => {
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const router = useRouter();

  // import cái useAuth từ AuthContext, nó sẽ giúp set cái state của thanh Header
  // từ đó tự động cập nhật thanh Header khi đăng nhập thành công
  const { login } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email) newErrors.email = 'Email không được để trống';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';

    if (!formData.password) newErrors.password = 'Mật khẩu không được để trống';
    else if (formData.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm() || !mounted) return;

    setLoading(true);
    try {
      const result = await login(formData);
      
      if (result.success) {
        console.log('Đăng nhập thành công, vui lòng chờ đợi...');
        router.push('/food-service');
      } else {
        setErrors({ ...errors, server: result.error || 'Đăng nhập thất bại. Vui lòng thử lại.' });
      }
    } catch (error: any) {
      console.error('Đăng nhập thất bại:', error);
      setErrors({ ...errors, server: 'Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-gray-600">
      <h2 className="text-2xl font-bold mb-6 text-center text-orange-500">Đăng Nhập</h2>

      {errors.server && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errors.server}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.email ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'
            }`}
            placeholder="Nhập email của bạn"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Mật khẩu</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.password ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'
            }`}
            placeholder="Nhập mật khẩu của bạn"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || !mounted}
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-orange-300"
        >
          {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link href="#" className="text-orange-500 hover:text-orange-600 text-sm">Quên mật khẩu?</Link>
      </div>

      <div className="mt-6 text-center text-gray-600 text-sm">
        Chưa có tài khoản?{' '}
        <Link href="/food-service/auth/register" className="text-orange-500 hover:text-orange-600 font-medium">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;