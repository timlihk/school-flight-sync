import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface FamilyAuthContextType {
  isAuthenticated: boolean;
  login: (secretPhrase: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const FamilyAuthContext = createContext<FamilyAuthContextType | undefined>(undefined);

export function useFamilyAuth() {
  const context = useContext(FamilyAuthContext);
  if (!context) {
    throw new Error('useFamilyAuth must be used within a FamilyAuthProvider');
  }
  return context;
}

interface FamilyAuthProviderProps {
  children: React.ReactNode;
}

const FAMILY_SECRET_KEY = 'family_secret';

export function FamilyAuthProvider({ children }: FamilyAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated on app load
    const storedSecret = localStorage.getItem(FAMILY_SECRET_KEY);
    if (storedSecret) {
      apiClient.setFamilySecret(storedSecret);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (secretPhrase: string): Promise<boolean> => {
    if (!secretPhrase.trim()) {
      return false;
    }
    
    // Set the secret in API client
    apiClient.setFamilySecret(secretPhrase);
    
    // Verify by making a test request
    try {
      const { error } = await apiClient.flights.getAll();
      if (error) {
        apiClient.clearFamilySecret();
        return false;
      }
      setIsAuthenticated(true);
      return true;
    } catch {
      apiClient.clearFamilySecret();
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    apiClient.clearFamilySecret();
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    loading,
  };

  return (
    <FamilyAuthContext.Provider value={value}>
      {children}
    </FamilyAuthContext.Provider>
  );
}