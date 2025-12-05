// Auth Context for HauntedAI
// Managed by Kiro

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../utils/apiClient';
import { web3Manager } from '../utils/web3';

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
  connectWalletOffline: (walletAddress: string) => void;
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
    const offlineMode = localStorage.getItem('offline_mode') === 'true';

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        // If offline mode, don't require token
        if (offlineMode || token) {
          // User is authenticated (either offline or with token)
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
        console.error('Failed to parse saved user:', error);
        }
        localStorage.removeItem('user');
        localStorage.removeItem('jwt_token');
      }
    }

    setIsLoading(false);

    // Listen for storage events (JWT cleared in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jwt_token' && !e.newValue) {
        // JWT was removed, log out
        setUser(null);
        localStorage.removeItem('user');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (walletAddress: string, signature: string, message: string = 'Sign this message to authenticate'): Promise<boolean> => {
    try {
      const response = await apiClient.login(walletAddress, signature, message);

      if (response.error || !response.data) {
        // Check if it's a connection error
        const errorMsg = response.error || '';
        if (errorMsg.includes('Failed to fetch') || errorMsg.includes('Network error') || response.status === 0) {
          // API is not available - throw error to be handled by caller
          // Don't log this as it's expected when API is offline
          throw new Error('ERR_CONNECTION_REFUSED');
        }
        
        // Only log unexpected errors
        if (process.env.NODE_ENV === 'development') {
        console.error('Login failed:', response.error);
        }
        return false;
      }

      const { accessToken, user: userData } = response.data as any;

      apiClient.setToken(accessToken);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return true;
    } catch (error: any) {
      // Re-throw connection errors (don't log as they're expected when API is offline)
      if (error?.message === 'ERR_CONNECTION_REFUSED' || error?.message?.includes('Failed to fetch')) {
        throw error;
      }
      // Only log unexpected errors
      if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error);
      }
      return false;
    }
  };

  const connectWalletOffline = (walletAddress: string) => {
    // Create a temporary user object for offline mode
    const offlineUser: User = {
      id: `offline_${walletAddress.slice(0, 10)}`,
      did: `did:ethr:${walletAddress}`,
      username: `Wallet_${walletAddress.slice(0, 6)}`,
      walletAddress,
    };

    setUser(offlineUser);
    localStorage.setItem('user', JSON.stringify(offlineUser));
    localStorage.setItem('offline_mode', 'true');
    localStorage.setItem('wallet_address', walletAddress);
  };

  const logout = async () => {
    // Clear API token
    apiClient.clearToken();
    
    // Disconnect wallet (remove event listeners)
    web3Manager.removeEventListeners();
    
    // Clear user state
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('offline_mode');
    localStorage.removeItem('wallet_address');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        connectWalletOffline,
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
