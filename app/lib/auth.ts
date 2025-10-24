const isBrowser = typeof window !== 'undefined';

export function getToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem('token');
}

export function getUserId(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem('user_id');
}

export function setAuth(token: string, userId: string): void {
  if (!isBrowser) return;
  localStorage.setItem('token', token);
  localStorage.setItem('user_id', userId);
}

export function clearAuth(): void {
  if (!isBrowser) return;
  localStorage.removeItem('token');
  localStorage.removeItem('user_id');
}

export function isAuthenticated(): boolean {
  if (!isBrowser) return false;
  const token = getToken();
  const userId = getUserId();
  return !!(token && userId);
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) {
    return { 'Content-Type': 'application/json' };
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export function requireAuth(): void {
  if (!isAuthenticated()) {
    throw new Error('กรุณาเข้าสู่ระบบก่อน');
  }
}

export function getAuthInfo(): { token: string | null; userId: string | null } {
  return {
    token: getToken(),
    userId: getUserId()
  };
}
