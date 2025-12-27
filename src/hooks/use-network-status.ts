import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnline: Date | null;
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastOnline: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setStatus(prev => ({
        isOnline: true,
        wasOffline: !prev.isOnline ? true : prev.wasOffline,
        lastOnline: new Date(),
      }));
    };

    const handleOffline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const clearWasOffline = useCallback(() => {
    setStatus(prev => ({ ...prev, wasOffline: false }));
  }, []);

  return {
    ...status,
    clearWasOffline,
  };
}

export default useNetworkStatus;
