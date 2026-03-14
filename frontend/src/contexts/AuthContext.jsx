import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axiosInstance';
import { AUTH } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const res = await API.get(AUTH.LOAD_USER);
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (loginid, password) => {
    const res = await API.post(AUTH.LOGIN, { loginid, password });
    await loadUser();
    return res.data;
  };

  const logout = async () => {
    try {
      await API.post(AUTH.LOGOUT);
    } catch {
      // ignore
    } finally {
      setUser(null);
    }
  };

  const register = async (data) => {
    const res = await API.post(AUTH.REGISTER, data);
    return res.data;
  };

  const requestOtp = async (email) => {
    const res = await API.post(AUTH.OTP_REQUEST, { email });
    return res.data;
  };

  const resetPassword = async (data) => {
    const res = await API.post(AUTH.PASSWORD_RESET_CONFIRM, data);
    return res.data;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    requestOtp,
    resetPassword,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
