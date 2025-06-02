import { createContext, useContext, useState, useEffect } from 'react';
import authAPI from '../utils/api';
import { formatErrorMessage } from '../utils/helpers'; //default

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on first render or when token changes
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const { user } = await authAPI.getCurrentUser();
          setCurrentUser(user);
        } catch (error) {
          console.error('Error loading user:', error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { token: newToken, user } = await authAPI.register(userData);
      
      // Save token in localStorage
      localStorage.setItem('token', newToken);
      
      // Update state
      setToken(newToken);
      setCurrentUser(user);
      
      return { success: true, user };
    } catch (error) {
      setError(formatErrorMessage(error));
      return { success: false, error: formatErrorMessage(error) };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const { token: newToken, user } = await authAPI.login(credentials);
      
      // Save token in localStorage
      localStorage.setItem('token', newToken);
      
      // Update state
      setToken(newToken);
      setCurrentUser(user);
      
      return { success: true, user };
    } catch (error) {
      setError(formatErrorMessage(error));
      return { success: false, error: formatErrorMessage(error) };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Update state
    setToken(null);
    setCurrentUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = !!token && !!currentUser;

  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};