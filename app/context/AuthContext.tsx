import React, { createContext, useContext, useState, useEffect } from 'react';
import { setItem, getItem, deleteItem } from '../utils/secureStore';
import { authAPI } from '../utils/api';

interface User {
  id: string;
  email: string;
  name: string;
  profile: any;
  settings: any;
  premium: boolean;
  partnerCode: string;
  pregnancyMode: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, goal?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await getItem('auth_token');
      if (storedToken) {
        setToken(storedToken);
        const res = await authAPI.me();
        setUser(res.data.user);
      }
    } catch (err) {
      // Token is invalid or expired — clear everything
      await deleteItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: newUser } = res.data;
    await setItem('auth_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    goal: string = 'tracking',
  ) => {
    const res = await authAPI.register({ name, email, password, goal });
    const { token: newToken, user: newUser } = res.data;
    await setItem('auth_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    await deleteItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);