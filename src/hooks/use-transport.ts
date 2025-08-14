import { useState, useEffect } from 'react';
import { TransportDetails } from '@/types/school';

const STORAGE_KEY = 'transport-data';

export function useTransport() {
  const [transport, setTransport] = useState<TransportDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedTransport = localStorage.getItem(STORAGE_KEY);
    if (savedTransport) {
      try {
        const parsedTransport = JSON.parse(savedTransport);
        setTransport(parsedTransport);
      } catch (error) {
        console.error('Error parsing saved transport:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const saveToStorage = (transportData: TransportDetails[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transportData));
  };

  const addTransport = (newTransport: Omit<TransportDetails, 'id'>) => {
    const transportWithId: TransportDetails = {
      ...newTransport,
      id: Date.now().toString(),
    };
    const updatedTransport = [...transport, transportWithId];
    setTransport(updatedTransport);
    saveToStorage(updatedTransport);
    return transportWithId;
  };

  const removeTransport = (transportId: string) => {
    const updatedTransport = transport.filter(t => t.id !== transportId);
    setTransport(updatedTransport);
    saveToStorage(updatedTransport);
  };

  const editTransport = (transportId: string, updates: Partial<TransportDetails>) => {
    const updatedTransport = transport.map(t =>
      t.id === transportId ? { ...t, ...updates } : t
    );
    setTransport(updatedTransport);
    saveToStorage(updatedTransport);
  };

  const getTransportForTerm = (termId: string) => {
    return transport.filter(t => t.termId === termId);
  };

  return {
    transport,
    isLoading,
    addTransport,
    removeTransport,
    editTransport,
    getTransportForTerm,
  };
}