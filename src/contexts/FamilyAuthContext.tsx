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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function FamilyAuthProvider({ children }: FamilyAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already authenticated on app load
    checkAuthStatus();
    
    // Set up auth error handler for 401 responses
    apiClient.setOnAuthError(() => {
      setIsAuthenticated(false);
      setError('Session expired. Please log in again.');
    });
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/status`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
      }
    } catch {
      // Ignore errors - user is not authenticated
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

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ secret: secretPhrase.trim() }),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({ authenticated: false }));
        if (data.authenticated === true) {
          setIsAuthenticated(true);
          return true;
        } else {
          setError(data.error || 'Authentication failed');
          return false;
        }
      } else {
        const data = await response.json().catch(() => ({ error: 'Invalid secret' }));
        setError(data.error || 'Invalid secret');
        return false;
      }
    } catch (err) {
      setError('Network error. Please try again.');
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setIsAuthenticated(false);
      setError(null);
    }
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
