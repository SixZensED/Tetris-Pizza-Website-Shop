// auth.ts
const isBrowser = typeof window !== 'undefined';

// Types
interface TokenPayload {
  userId: string;
  email?: string;
  full_name?: string;
  role?: string;
  exp?: number;
  [key: string]: any;
}

// Token Management
export function getToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  if (!isBrowser) return;
  localStorage.setItem('token', token);
}

export function removeToken(): void {
  if (!isBrowser) return;
  localStorage.removeItem('token');
}

// User ID Management
export function getUserId(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem('user_id');
}

export function setUserId(userId: string): void {
  if (!isBrowser) return;
  localStorage.setItem('user_id', userId);
}

export function removeUserId(): void {
  if (!isBrowser) return;
  localStorage.removeItem('user_id');
}

// Authentication State
export function setAuth(token: string): void {
  setToken(token);
  const payload = parseJwt(token);
  if (payload && payload.userId) {
    setUserId(payload.userId.toString());
  }
}

export function clearAuth(): void {
  removeToken();
  removeUserId();
}

// Token Validation
export function parseJwt(token: string): TokenPayload | null {
  try {
    if (!token) {
      console.error('No token provided');
      return null;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format: expected 3 parts');
      return null;
    }

    // Replace URL-safe base64 characters and add padding if needed
    const base64Url = parts[1];
    const base64 = base64Url
      .replace(/\-/g, '+')
      .replace(/\_/g, '/');
    
    const paddedBase64 = base64.padEnd(
      base64.length + (4 - (base64.length % 4)) % 4,
      '='
    );

    try {
      const decoded = JSON.parse(atob(paddedBase64));
      return decoded as TokenPayload;
    } catch (e) {
      console.error('Failed to parse token payload:', e);
      return null;
    }
  } catch (e) {
    console.error('Failed to parse JWT:', e);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  if (!token) return true;
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  return payload.exp * 1000 < Date.now();
}

export function isAuthenticated(): boolean {
  if (!isBrowser) return false;
  const token = getToken();
  const userId = getUserId();
  return !!(token && userId && !isTokenExpired(token));
}

// User Role Management
export function getUserRole(): string {
  if (!isBrowser) return 'guest';
  const token = getToken();
  if (!token) return 'guest';
  
  const payload = parseJwt(token);
  return payload?.role || 'user';
}

export function hasRole(requiredRole: string): boolean {
  if (!isBrowser) return false;
  return getUserRole() === requiredRole;
}

export function hasAnyRole(roles: string[]): boolean {
  if (!isBrowser) return false;
  return roles.includes(getUserRole());
}

// API Helpers
export function getAuthHeaders(additionalHeaders: Record<string, string> = {}): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// Token Refresh
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export async function refreshToken(): Promise<boolean> {
  if (!isBrowser) return false;
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = new Promise(async (resolve) => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      
      if (response.ok) {
        const { token } = await response.json();
        setToken(token);
        resolve(true);
      } else {
        clearAuth();
        resolve(false);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuth();
      resolve(false);
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  });

  return refreshPromise;
}

// Auth Guard
export function requireAuth(): void {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }
}

export function requireRole(role: string): void {
  if (!hasRole(role)) {
    throw new Error(`Role ${role} required`);
  }
}

// User Info
export function getAuthInfo(): { 
  isAuthenticated: boolean; 
  userId: string | null; 
  userRole: string;
  userEmail?: string;
  userName?: string;
} {
  if (!isBrowser) {
    return { 
      isAuthenticated: false, 
      userId: null, 
      userRole: 'guest' 
    };
  }

  const token = getToken();
  const payload = token ? parseJwt(token) : null;

  return {
    isAuthenticated: isAuthenticated(),
    userId: getUserId(),
    userRole: payload?.role || 'guest',
    userEmail: payload?.email,
    userName: payload?.full_name
  };
}

// Sync auth state across tabs
if (isBrowser) {
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === 'token' || event.key === 'user_id') {
      window.location.reload();
    }
  });
}

// Auto-clear invalid tokens
if (isBrowser) {
  const token = getToken();
  if (token && isTokenExpired(token)) {
    clearAuth();
  }
}