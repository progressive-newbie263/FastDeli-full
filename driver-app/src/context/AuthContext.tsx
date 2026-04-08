import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AUTH_API_CANDIDATES, AUTH_API_URL } from '../constants/api';
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

const parseTimeoutMs = (raw: string | undefined, fallback = 4500) => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 1500), 20000);
};

const REQUEST_TIMEOUT_MS = parseTimeoutMs(process.env.EXPO_PUBLIC_API_TIMEOUT_MS, 4500);
const COLD_START_RETRY_ROUNDS = 2;
const COLD_START_RETRY_DELAY_MS = 600;

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

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal as any,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout (${timeoutMs}ms)`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const postAuth = async (path: string, payload: object) => {
  let connectivityError: Error | null = null;

  for (let round = 0; round < COLD_START_RETRY_ROUNDS; round++) {
    for (const baseUrl of AUTH_API_CANDIDATES) {
      try {
        const response = await fetchWithTimeout(`${baseUrl}${path}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'bypass-tunnel-reminder': 'true',
          },
          body: JSON.stringify(payload),
        });

        try {
          const data = (await response.json()) as AuthApiResponse;
          return { response, data };
        } catch {
          // Tunnel URL sai dich vu thuong tra HTML/plain text, thu base URL tiep theo.
          connectivityError = new Error(`Phan hoi khong hop le tu ${baseUrl}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown error';
        connectivityError = new Error(`${baseUrl}: ${message}`);
      }
    }

    if (round < COLD_START_RETRY_ROUNDS - 1) {
      // Tunnel moi khoi dong doi khi can mot nhip de route on dinh.
      await sleep(COLD_START_RETRY_DELAY_MS * (round + 1));
    }
  }

  if (connectivityError) {
    throw new Error(
      `Khong ket noi duoc API auth. URL uu tien: ${AUTH_API_URL}. Da thu: ${AUTH_API_CANDIDATES.join(', ')}. Chi tiet: ${connectivityError.message}`
    );
  }

  throw new Error('Khong ket noi duoc API auth.');
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
