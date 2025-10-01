"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@food/utils/api';
import { formatErrorMessage } from '@client/food-service/utils/helpers';
import { toast } from "react-toastify";

interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  gender?: string;
  date_of_birth?: string;
  account_balance?: number;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  register: (userData: any) => Promise<{ success: boolean; user?: User; error?: string }>;
  login: (credentials: any) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  
  // Bổ sung:
  setCurrentUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // function hiển thị toast báo lỗi
  const showErrorToast = (msg: string) => {
    toast.error(msg, {
      position: "top-center",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });
  };

  // Initialize token from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUserData = localStorage.getItem('userData');
      
      if (storedToken && storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          setToken(storedToken);
          setCurrentUser(userData);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
        }
      }
      setLoading(false);
    }
  }, []);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      if (token && !currentUser) {
        try {
          const { user } = await authAPI.getCurrentUser();
          setCurrentUser(user);
          localStorage.setItem('userData', JSON.stringify(user));
        } catch (error) {
          console.error('Error loading user:', error);
          logout();
        }
      }
    };

    if (token) {
      loadUser();
    }
  }, [token, currentUser]);

  // Register user
  const register = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const { token: newToken, user } = await authAPI.register(userData);
      
      // Save token and user data in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('userData', JSON.stringify(user));
      
      // Update state
      setToken(newToken);
      setCurrentUser(user);
      
      return { success: true, user };
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      setError(errorMessage);
      showErrorToast(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const { token: newToken, user } = await authAPI.login(credentials);
      
      // Save token and user data in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('userData', JSON.stringify(user));
      
      // Update state
      setToken(newToken);
      setCurrentUser(user);
      
      return { success: true, user };
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      setError(errorMessage);
      showErrorToast(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    // Remove token and user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    
    // Update state
    setToken(null);
    setCurrentUser(null);
    setError(null);

    if (typeof window !== 'undefined') { 
      window.location.reload();
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!token && !!currentUser;

  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    setCurrentUser, // Bổ sung để cập nhật currentUser từ bên ngoài
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};