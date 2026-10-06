import api from '@/lib/api';
import { ApiResponse, User } from '@/types';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: 'student' | 'instructor';
}

export interface RegisterResponseData {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  isVerified: boolean;
  verificationToken?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseData {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  token: string;
}

export const authService = {
  async register(payload: RegisterDto): Promise<ApiResponse<RegisterResponseData>> {
    const response = await api.post<ApiResponse<RegisterResponseData>>('/auth/register', payload);
    return response.data;
  },

  async login(payload: LoginDto): Promise<ApiResponse<LoginResponseData>> {
    const response = await api.post<ApiResponse<LoginResponseData>>('/auth/login', payload);
    return response.data;
  },

  async verifyEmail(token: string): Promise<ApiResponse<{ id: string; email: string; isVerified: boolean }>> {
    const response = await api.post<ApiResponse<{ id: string; email: string; isVerified: boolean }>>(
      '/auth/verify',
      { token }
    );
    return response.data;
  },

  async resendVerification(email: string): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>('/auth/resend-verification', { email });
    return response.data;
  },

  async switchToInstructor(): Promise<ApiResponse<User>> {
    const response = await api.patch<ApiResponse<User>>('/auth/switch-to-instructor');
    return response.data;
  },
};
