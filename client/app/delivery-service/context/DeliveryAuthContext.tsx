"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface User {
  user_id: number;
  full_name: string;
  email: string;
  role?: string;
  phone_number?: string;
  avatar_url?: string;
  service?: string[];
}

interface DeliveryAuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string; requireConfirmation?: boolean }>;
  logout: () => void;
}

const DeliveryAuthContext = createContext<DeliveryAuthContextType | undefined>(undefined);

export const useDeliveryAuth = () => {
  const context = useContext(DeliveryAuthContext);
  if (context === undefined) {
    throw new Error('useDeliveryAuth must be used within a DeliveryAuthProvider');
  }
  return context;
};

export const DeliveryAuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('delivery_token');
    const storedUser = localStorage.getItem('delivery_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: any) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        ...credentials,
        service: 'delivery'
      });
      
      const { token: newToken, user } = res.data;
      localStorage.setItem('delivery_token', newToken);
      localStorage.setItem('delivery_user', JSON.stringify(user));
      setToken(newToken);
      setCurrentUser(user);
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || "Đăng nhập thất bại";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (userData: any) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, {
        ...userData,
        service: 'delivery'
      });

      if (res.data.requireConfirmation) {
        return { 
          success: false, 
          requireConfirmation: true, 
          error: res.data.message 
        };
      }

      const { token: newToken, user } = res.data;
      localStorage.setItem('delivery_token', newToken);
      localStorage.setItem('delivery_user', JSON.stringify(user));
      setToken(newToken);
      setCurrentUser(user);
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || "Đăng ký thất bại";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('delivery_token');
    localStorage.removeItem('delivery_user');
    setToken(null);
    setCurrentUser(null);
    window.location.href = '/delivery-service/auth/login';
  };

  const value = {
    currentUser,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout
  };

  return (
    <DeliveryAuthContext.Provider value={value}>
      {children}
    </DeliveryAuthContext.Provider>
  );
};
