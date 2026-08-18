import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  energy: number;
  toasts: number;
  toastsCollected: number; // using DB name
  lastLogin: string;
  inventory?: Array<{ item: string; quantity: number; obtainedFrom: string; rarity?: string }>;
  achievements?: Array<{ name: string; description: string; points: number }>;
  timePeriodsVisited?: Array<{ period: string; visits: number }>;
  upgrades?: Array<{ name: string; level: number }>;
  lastQuantumSpin?: string;
  claimedQuests?: string[];
  bankBalance?: number;
  lastInterestClaim?: string;
  bossHp?: number;
  bossMaxHp?: number;
  bossName?: string;
  overclockUntil?: string;
  equippedGear?: Array<{ slot: string; item: string; rarity?: string }>;
  faction?: string;
  hasHarvester?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const refreshUser = async () => {
    try {
      if (token) {
        const response = await api.get('/users/me');
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
