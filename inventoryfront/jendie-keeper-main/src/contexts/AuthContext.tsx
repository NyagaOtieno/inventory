import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { mockUsers, initializeMockData } from '@/lib/mockData';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'dealer';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  setUser?: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ safer navigate wrapper to prevent navigation before Router is ready
  const safeNavigate = (path: string) => {
    if (location.pathname !== path) navigate(path);
  };

  useEffect(() => {
    initializeMockData();

    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!foundUser) {
      throw new Error('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    localStorage.setItem('mockUser', JSON.stringify(userWithoutPassword));
    setUser(userWithoutPassword);

    // ✅ redirect to dashboard safely
    safeNavigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('mockUser');
    setUser(null);
    safeNavigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isLoading, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
