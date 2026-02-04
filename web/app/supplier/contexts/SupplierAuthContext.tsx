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

      // Lấy thông tin nhà hàng từ API
      try {
        await fetchRestaurantData();
      } catch (err) {
        console.error('Failed to fetch restaurant data:', err);
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

  const fetchRestaurantData = async (): Promise<void> => {
    try {
      const response = await SupplierAPI.getMyRestaurant();
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
      // Call real API
      const response = await SupplierAPI.login(email, password);

      if (!response.success) {
        return {
          success: false,
          message: response.message || 'Đăng nhập thất bại.'
        };
      }

      // Token và user đã được lưu trong SupplierAPI.login()
      const storedUser = localStorage.getItem('supplier_user');
      if (storedUser) {
        const userData: SupplierUser = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);

        // Lấy thông tin nhà hàng
        const restaurantResponse = await SupplierAPI.getMyRestaurant();
        if (restaurantResponse.success && restaurantResponse.data) {
          setRestaurant(restaurantResponse.data);
          // Lưu restaurant_id
          localStorage.setItem('supplier_restaurant_id', restaurantResponse.data.id.toString());
        }
      }

      return {
        success: true,
        message: 'Đăng nhập thành công!'
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
    await fetchRestaurantData();
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
