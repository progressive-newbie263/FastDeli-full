'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import SupplierAPI from '../lib/api';
import type { SupplierUser, Restaurant } from '../types';

interface SupplierAuthContextType {
  //id: number;
  user: SupplierUser | null;
  restaurant: Restaurant | null;
  full_name: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshRestaurantData: () => Promise<void>;
}

const SupplierAuthContext = createContext<SupplierAuthContextType | undefined>(undefined);

//demo tài khoản ảo (nhà hàng liên kết)
const DEMO_CREDENTIALS = {
  email: 'supplier@fastdeli.com',
  password: 'supplier123'
};
//demo tài khoản ảo (server side)
const DEMO_USER: SupplierUser = {
  user_id: 1,
  email: 'supplier@fastdeli.com',
  full_name: 'Nhà hàng Demo',
  role: 'restaurant_owner',
  restaurant_id: 1,
  restaurant_name: 'Nhà hàng Phở Việt Nam',
  avatar_url: ''
};

export function SupplierAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupplierUser | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    let mounted = true;
    
    const performCheck = async () => {
      await checkAuth();
      // Fallback: đảm bảo loading không bao giờ bị stuck quá 3 giây
      setTimeout(() => {
        if (mounted) {
          setIsLoading(false);
        }
      }, 3000);
    };

    performCheck();

    return () => {
      mounted = false;
    };
  }, []);

  const checkAuth = async () => {
    try {
      // Chỉ check localStorage ở client side
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('supplier_token');
      const storedUser = localStorage.getItem('supplier_user');
      const restaurantId = localStorage.getItem('supplier_restaurant_id');

      if (!token || !storedUser) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      const userData: SupplierUser = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);

      // Lấy thông tin nhà hàng nếu có restaurant_id
      if (restaurantId) {
        try {
          await fetchRestaurantData(parseInt(restaurantId));
        } catch (err) {
          console.error('Failed to fetch restaurant data:', err);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      setRestaurant(null);
    }
  };

  const fetchRestaurantData = async (restaurantId: number): Promise<void> => {
    try {
      const response = await SupplierAPI.getMyRestaurant(restaurantId);
      if (response.success && response.data) {
        setRestaurant(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch restaurant data:', error);
      // Không throw error để không block loading
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Check hardcoded credentials
      if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        // Mock token
        const mockToken = 'demo_supplier_token_' + Date.now();

        // Store in localStorage
        localStorage.setItem('supplier_token', mockToken);
        localStorage.setItem('supplier_user', JSON.stringify(DEMO_USER));
        localStorage.setItem('supplier_restaurant_id', '1');

        setUser(DEMO_USER);
        setIsAuthenticated(true);
        
        // Load mock restaurant data
        await fetchRestaurantData(1);

        return {
          success: true,
          message: 'Đăng nhập thành công!'
        };
      }

      // Invalid credentials
      return {
        success: false,
        message: 'Email hoặc mật khẩu không đúng. Vui lòng sử dụng tài khoản demo.'
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Đã xảy ra lỗi khi đăng nhập.'
      };
    }
  };

  const logout = () => {
    SupplierAPI.clearAuth();
    setUser(null);
    setRestaurant(null);
    setIsAuthenticated(false);
    router.push('/supplier/login');
  };

  const refreshRestaurantData = async () => {
    const restaurantId = localStorage.getItem('supplier_restaurant_id');
    if (restaurantId) {
      await fetchRestaurantData(parseInt(restaurantId));
    }
  };

  return (
    <SupplierAuthContext.Provider
      value={{
        user,
        restaurant,
        isAuthenticated,
        isLoading,
        full_name: user?.full_name || '',
        login,
        logout,
        refreshRestaurantData,
      }}
    >
      {children}
    </SupplierAuthContext.Provider>
  );
}

export function useSupplierAuth() {
  const context = useContext(SupplierAuthContext);
  if (context === undefined) {
    throw new Error('useSupplierAuth must be used within SupplierAuthProvider');
  }
  return context;
}
