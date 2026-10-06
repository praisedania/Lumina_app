'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService, LoginDto, RegisterDto } from '@/services/auth.service';
import { User } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<{ verificationToken?: string }>;
  logout: () => void;
  switchToInstructor: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Hydrate auth state from localStorage on client mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('lumina_token');
      const storedUser = localStorage.getItem('lumina_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to parse stored auth data:', e);
      localStorage.removeItem('lumina_token');
      localStorage.removeItem('lumina_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('lumina_token');
    localStorage.removeItem('lumina_user');
    setToken(null);
    setUser(null);
    toast.info('You have been logged out.');
    router.push('/login');
  }, [router]);

  // Listen for automatic logout triggers (e.g. 401 response from Axios interceptor)
  useEffect(() => {
    const handleAutoLogout = () => {
      logout();
    };
    window.addEventListener('lumina_auth_logout', handleAutoLogout);
    return () => window.removeEventListener('lumina_auth_logout', handleAutoLogout);
  }, [logout]);

  const login = async (credentials: LoginDto) => {
    try {
      const res = await authService.login(credentials);
      const data = res.data;

      const authenticatedUser: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        isVerified: true,
      };

      setToken(data.token);
      setUser(authenticatedUser);

      localStorage.setItem('lumina_token', data.token);
      localStorage.setItem('lumina_user', JSON.stringify(authenticatedUser));

      toast.success(`Welcome back, ${authenticatedUser.name}!`);

      if (authenticatedUser.role === 'instructor') {
        router.push('/instructor');
      } else if (authenticatedUser.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const message = err.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      throw err;
    }
  };

  const register = async (data: RegisterDto) => {
    try {
      const res = await authService.register(data);
      toast.success(res.message || 'Registration successful! Please verify your email.');
      return { verificationToken: res.data.verificationToken };
    } catch (err: any) {
      const message = err.message || 'Registration failed.';
      toast.error(message);
      throw err;
    }
  };

  const switchToInstructor = async () => {
    try {
      const res = await authService.switchToInstructor();
      if (user) {
        const updatedUser: User = { ...user, role: 'instructor' };
        setUser(updatedUser);
        localStorage.setItem('lumina_user', JSON.stringify(updatedUser));
        toast.success('You are now registered as an Instructor!');
        router.push('/instructor');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to switch to instructor.');
      throw err;
    }
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updated };
      setUser(newUser);
      localStorage.setItem('lumina_user', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        switchToInstructor,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
