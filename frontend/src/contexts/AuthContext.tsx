import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const API_URL = '/api';

interface User {
  id: number;
  email: string;
  nickname: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return !!localStorage.getItem('admin_token');
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/users/login`, { email });
      const userData = response.data;
      setUser(userData);
      setIsAdmin(!!localStorage.getItem('admin_token'));
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('user');
    localStorage.removeItem('admin_token');
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
