'use client';

import { useEffect, useState } from 'react';
import { getAuthInfo, isAuthenticated } from '@/app/lib/auth';

export function useAuth() {
  const [authState, setAuthState] = useState(() => ({
    isAuthenticated: false,
    isLoading: true,
    user: null as any
  }));

  useEffect(() => {
    // Initial check
    updateAuthState();

    // Listen for storage events to update auth state when it changes in other tabs
    const handleStorageChange = () => {
      updateAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateAuthState = () => {
    const authInfo = getAuthInfo();
    setAuthState({
      isAuthenticated: isAuthenticated(),
      isLoading: false,
      user: authInfo
    });
  };

  return {
    ...authState,
    updateAuthState
  };
}
