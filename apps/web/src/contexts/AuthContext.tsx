// Auth Context for HauntedAI
// Managed by Kiro

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../utils/apiClient';

interface User {
  id: string;
  did: string;
  username: string;
  walletAddress?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (walletAddress: string, signature: string, message?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('jwt_token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('jwt_token');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (walletAddress: string, signature: string, message: string = 'Sign this message to authenticate'): Promise<boolean> => {
    try {
      const response = await apiClient.login(walletAddress, signature, message);

      if (response.error || !response.data) {
        console.error('Login failed:', response.error);
        return false;
      }

      const { accessToken, user: userData } = response.data as any;

      apiClient.setToken(accessToken);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
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
