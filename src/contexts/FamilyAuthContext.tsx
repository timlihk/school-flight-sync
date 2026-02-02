import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface FamilyAuthContextType {
  isAuthenticated: boolean;
  login: (secretPhrase: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
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

const STORAGE_KEY = 'family_secret';

export function FamilyAuthProvider({ children }: FamilyAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedSecret = localStorage.getItem(STORAGE_KEY);
    if (savedSecret) {
      apiClient.setFamilySecret(savedSecret);
      void verifySecret(savedSecret);
    } else {
      setLoading(false);
    }

    // Any 401 from apiClient should log the user out
    apiClient.setOnAuthError(() => {
      apiClient.setFamilySecret(null);
      localStorage.removeItem(STORAGE_KEY);
      setIsAuthenticated(false);
      setError('Session expired or invalid family secret. Please log in again.');
    });
  }, []);

  const verifySecret = async (secret: string): Promise<boolean> => {
    try {
      // Call a lightweight endpoint to validate the secret
      const { error } = await apiClient.flights.getAll();
      if (error) throw error;
      setIsAuthenticated(true);
      setError(null);
      localStorage.setItem(STORAGE_KEY, secret);
      return true;
    } catch (err) {
      console.error('Auth verification failed', err);
      apiClient.setFamilySecret(null);
      localStorage.removeItem(STORAGE_KEY);
      setIsAuthenticated(false);
      setError('Invalid family secret. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (secretPhrase: string): Promise<boolean> => {
    setError(null);
    
    if (!secretPhrase.trim()) {
      setError('Please enter the family secret');
      return false;
    }

    const cleanedSecret = secretPhrase.trim();
    apiClient.setFamilySecret(cleanedSecret);
    const ok = await verifySecret(cleanedSecret);
    if (!ok) {
      apiClient.setFamilySecret(null);
    }
    return ok;
  };

  const logout = async () => {
    apiClient.setFamilySecret(null);
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
    setError(null);
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    loading,
    error,
  };

  return (
    <FamilyAuthContext.Provider value={value}>
      {children}
    </FamilyAuthContext.Provider>
  );
}
