import { useState } from 'react';
import Link from 'next/link';
import useNavigate from 'next/navigation';
import axios from 'axios';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing in that field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email không được để trống';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
    
    if (!formData.password) newErrors.password = 'Mật khẩu không được để trống';
    else if (formData.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', formData);
      // Lưu token vào localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      
      // Chuyển hướng đến trang chủ
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.data) {
        // Hiển thị lỗi từ server
        setErrors({
          ...errors,
          server: error.response.data.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
        });
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

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-orange-500">Đăng Nhập</h2>
      
      {errors.server && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errors.server}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Email
          </label>
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
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
            Mật khẩu
          </label>
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
          disabled={loading}
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-orange-300"
        >
          {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <Link href="/forgot-password" className="text-orange-500 hover:text-orange-600 text-sm">
          Quên mật khẩu?
        </Link>
      </div>
      
      <div className="mt-6 text-center text-gray-600 text-sm">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="text-orange-500 hover:text-orange-600 font-medium">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;