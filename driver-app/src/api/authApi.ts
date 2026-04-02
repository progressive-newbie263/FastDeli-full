import { authUrl, httpPost } from './http';
import { DEV_MOCK_MODE, MOCK_DRIVER_ACCOUNT } from '../config/api';

export type LoginResponse = {
  success: true;
  token: string;
  user: unknown;
  message?: string;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  if (DEV_MOCK_MODE) {
    console.log('[authApi] DEV_MOCK_MODE enabled');
    if (email !== MOCK_DRIVER_ACCOUNT.email || password !== MOCK_DRIVER_ACCOUNT.password) {
      throw new Error(
        `Mock account: ${MOCK_DRIVER_ACCOUNT.email} / ${MOCK_DRIVER_ACCOUNT.password}`
      );
    }

    return {
      success: true,
      token: MOCK_DRIVER_ACCOUNT.token,
      user: MOCK_DRIVER_ACCOUNT.user,
      message: 'Mock login success',
    };
  }

  console.log('[authApi] login request', {
    email,
    endpoint: authUrl.login,
  });
  return httpPost<LoginResponse>(authUrl.login, { email, password });
}

