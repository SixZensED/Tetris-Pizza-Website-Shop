'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, clearAuth as clearAuthStorage, getAuthHeaders } from '@/app/lib/auth';

type User = {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  balance?: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  revalidateUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/api/me`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
      } else {
        clearAuthStorage();
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        fetchUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (token: string) => {
    setIsLoading(true);
    await fetchUser();
  };

  const revalidateUser = async () => {
    setIsLoading(true);
    await fetchUser();
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !isLoading && !!user,
        isLoading,
        login,
        logout,
        revalidateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}