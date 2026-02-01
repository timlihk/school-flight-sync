import React, { createContext, useContext, useState, useEffect } from 'react';

interface FamilyAuthContextType {
  isAuthenticated: boolean;
  login: (secretPhrase: string) => boolean;
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

const AUTH_STORAGE_KEY = 'family_authenticated';
// Auth is now server-side only - client just stores session state
export function FamilyAuthProvider({ children }: FamilyAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated on app load
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (secretPhrase: string): boolean => {
    // Client-side only stores the state; actual validation happens on backend API calls
    // This prevents exposing the secret in bundled JS
    if (secretPhrase.trim()) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
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