import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) { setLoading(false); return; }

    try {
      const { exp } = jwtDecode(accessToken);
      // If access token is still valid, fetch user profile
      if (exp * 1000 > Date.now()) {
        const { data } = await authService.getMe();
        setUser(data.user);
      } else {
        // Expired — interceptor will refresh; just try getMe and let it handle it
        const { data } = await authService.getMe();
        setUser(data.user);
      }
    } catch {
      localStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { initAuth(); }, [initAuth]);

  const login = async (email, password) => {
    const { data } = await authService.login(email, password);
    localStorage.setItem('access_token',  data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
