import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AUTH_API_URL } from '../constants/api';
import { AuthApiResponse, DriverUser, RegisterInput } from '../types/auth';

type AuthContextValue = {
  isHydrating: boolean;
  token: string | null;
  user: DriverUser | null;
  login: (email: string, password: string) => Promise<void>;
  registerDriver: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_TOKEN_KEY = 'driver_token';
const STORAGE_USER_KEY = 'driver_user';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const parseErrors = (data: AuthApiResponse): string => {
  if (data.message) {
    return data.message;
  }

  if (data.errors?.length) {
    const firstError = data.errors[0];
    for (const key in firstError) {
      const message = firstError[key];
      if (message) {
        return message;
      }
    }
  }

  return 'Có lỗi xảy ra, vui lòng thử lại.';
};

const persistSession = async (token: string, user: DriverUser) => {
  await AsyncStorage.multiSet([
    [STORAGE_TOKEN_KEY, token],
    [STORAGE_USER_KEY, JSON.stringify(user)],
  ]);
};

const postAuth = async (path: string, payload: object) => {
  try {
    const response = await fetch(`${AUTH_API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as AuthApiResponse;
    return { response, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    throw new Error(`Khong ket noi duoc API (${AUTH_API_URL}). Chi tiet: ${message}`);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isHydrating, setIsHydrating] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DriverUser | null>(null);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const [savedToken, savedUser] = await AsyncStorage.multiGet([
          STORAGE_TOKEN_KEY,
          STORAGE_USER_KEY,
        ]);

        const tokenValue = savedToken?.[1] || null;
        const userValue = savedUser?.[1] || null;

        if (tokenValue && userValue) {
          setToken(tokenValue);
          setUser(JSON.parse(userValue));
        }
      } finally {
        setIsHydrating(false);
      }
    };

    hydrate();
  }, []);

  const logout = async () => {
    await AsyncStorage.multiRemove([STORAGE_TOKEN_KEY, STORAGE_USER_KEY]);
    setToken(null);
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    const { response, data } = await postAuth('/api/auth/login', { email, password });

    if (!response.ok || !data.success || !data.user || !data.token) {
      throw new Error(parseErrors(data));
    }

    if (data.user.role !== 'driver') {
      throw new Error('Tài khoản không thuộc role driver.');
    }

    await persistSession(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
  };

  const registerDriver = async (input: RegisterInput) => {
    const { response, data } = await postAuth('/api/auth/register-driver', input);

    if (!response.ok || !data.success || !data.user || !data.token) {
      throw new Error(parseErrors(data));
    }

    if (data.user.role !== 'driver') {
      throw new Error('Đăng ký chưa tạo được role driver.');
    }

    await persistSession(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
  };

  const value = useMemo(
    () => ({
      isHydrating,
      token,
      user,
      login,
      registerDriver,
      logout,
    }),
    [isHydrating, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
