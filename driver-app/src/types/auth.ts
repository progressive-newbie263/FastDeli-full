export type DriverUser = {
  user_id: number;
  phone_number?: string;
  email: string;
  full_name: string;
  role: string;
};

export type AuthApiResponse = {
  success: boolean;
  message?: string;
  token?: string;
  user?: DriverUser;
  errors?: Array<Record<string, string>>;
};

export type RegisterInput = {
  phone_number: string;
  email: string;
  password: string;
  full_name: string;
  gender?: 'male' | 'female' | 'other';
  date_of_birth?: string;
};
