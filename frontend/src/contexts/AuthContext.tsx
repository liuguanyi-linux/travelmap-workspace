import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Determine API URL based on environment
const API_URL = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3000');

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
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      // Fix for legacy Date.now() IDs that overflow Prisma 32-bit Int
      if (parsed.id > 2147483647) {
        parsed.id = 1; 
        localStorage.setItem('user', JSON.stringify(parsed));
      }
      return parsed;
    }
    return null;
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      return parsedUser.email === 'admin@travelmap.com';
    }
    return false;
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      // Call backend API to login/register the user
      const response = await axios.post(`${API_URL}/users/login`, { email });
      const userData = response.data;

      setUser(userData);
      if (email === 'admin@travelmap.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      // Fallback for static/demo mode if backend is completely down
      const fallbackUserData = {
        id: email === 'admin@travelmap.com' ? 1 : Math.floor(Math.random() * 100000) + 2,
        email,
        nickname: email.split('@')[0]
      };
      setUser(fallbackUserData);
      setIsAdmin(email === 'admin@travelmap.com');
      localStorage.setItem('user', JSON.stringify(fallbackUserData));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('user');
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
