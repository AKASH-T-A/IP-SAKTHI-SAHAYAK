/**
 * IP-SAKTI — Auth API calls
 */
import apiClient from './client';

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  language_preference?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'expert' | 'user' | 'readonly';
  language_preference: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserPublic;
}

export const authApi = {
  register: (data: RegisterData) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginData) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  refresh: (refresh_token: string) =>
    apiClient.post<AuthResponse>('/auth/refresh', { refresh_token }).then((r) => r.data),

  me: () =>
    apiClient.get<UserPublic>('/auth/me').then((r) => r.data),
};
