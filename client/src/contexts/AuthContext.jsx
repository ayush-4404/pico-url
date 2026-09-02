import { createContext, useState, useCallback } from 'react';
import * as authApi from '../api/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pico_user')); }
    catch { return null; }
  });

  const saveSession = useCallback((token, userData) => {
    localStorage.setItem('pico_token', token);
    localStorage.setItem('pico_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pico_token');
    localStorage.removeItem('pico_user');
    setUser(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    saveSession(res.data.token, res.data.user);
    return res.data;
  }, [saveSession]);

  const register = useCallback(async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    saveSession(res.data.token, res.data.user);
    return res.data;
  }, [saveSession]);

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
