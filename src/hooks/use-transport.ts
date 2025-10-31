import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { TransportDetails } from '@/types/school';
import { useToast } from '@/hooks/use-toast';

// Query keys for React Query
const QUERY_KEYS = {
  transport: ['transport'] as const,
} as const;

export function useTransport() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch transport with React Query
  const fetchTransport = async (): Promise<TransportDetails[]> => {
    const { data, error } = await apiClient.transport.getAll();

    if (error) throw error;

    // Transform database format to TransportDetails format
    return data?.map((transport) => ({
      id: transport.id,
      termId: transport.term_id,
      type: transport.type as 'school-coach' | 'taxi',
      direction: transport.direction ? (transport.direction as 'outbound' | 'return') : undefined,
      driverName: transport.driver_name,
      phoneNumber: transport.phone_number,
      licenseNumber: transport.license_number,
      pickupTime: transport.pickup_time,
      notes: transport.notes || undefined,
    })) || [];
  };

  const {
    data: transport = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.transport,
    queryFn: fetchTransport,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });


  React.useEffect(() => {
    if (error) {
      console.error('Error loading transport:', error);
      toast({
        title: "Error Loading Transport",
        description: "Failed to load transport data from database.",
        variant: "destructive",
      });
    }
  }, [error, toast]);


  // Add transport mutation with optimistic updates
  const addTransportMutation = useMutation({
    mutationFn: async (newTransport: Omit<TransportDetails, 'id'>): Promise<TransportDetails> => {
      const dbTransport = {
        term_id: newTransport.termId,
        type: newTransport.type,
        ...(newTransport.direction && { direction: newTransport.direction }),
        driver_name: newTransport.driverName,
        phone_number: newTransport.phoneNumber,
        license_number: newTransport.licenseNumber,
        pickup_time: newTransport.pickupTime,
        notes: newTransport.notes || null,
      };

      const { data, error } = await apiClient.transport.create(dbTransport);

      if (error) throw error;

      return {
        id: data.id,
        termId: data.term_id,
        type: data.type as 'school-coach' | 'taxi',
        direction: data.direction as 'outbound' | 'return',
        driverName: data.driver_name,
        phoneNumber: data.phone_number,
        licenseNumber: data.license_number,
        pickupTime: data.pickup_time,
        notes: data.notes || undefined,
      };
    },
    onMutate: async (newTransport) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.transport });
      const previousTransport = queryClient.getQueryData<TransportDetails[]>(QUERY_KEYS.transport);

      const optimisticTransport: TransportDetails = {
        ...newTransport,
        id: `temp-${Date.now()}`,
      };
      
      queryClient.setQueryData<TransportDetails[]>(QUERY_KEYS.transport, (old = []) => [
        ...old,
        optimisticTransport,
      ]);

      return { previousTransport };
    },
    onError: (error, newTransport, context) => {
      if (context?.previousTransport) {
        queryClient.setQueryData(QUERY_KEYS.transport, context.previousTransport);
      }
      
      console.error('Error adding transport:', error);
      toast({
        title: "Error Adding Transport",
        description: "Failed to save transport to database.",
        variant: "destructive",
      });
    },
    onSuccess: (addedTransport) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transport });
      
      toast({
        title: "Transport Added",
        description: `${addedTransport.type === 'school-coach' ? 'School coach' : 'Taxi'} transport has been saved.`,
      });
      
      return addedTransport;
    },
  });

  const addTransport = (newTransport: Omit<TransportDetails, 'id'>) => {
    return addTransportMutation.mutateAsync(newTransport);
  };

  // Remove transport mutation with optimistic updates
  const removeTransportMutation = useMutation({
    mutationFn: async (transportId: string): Promise<void> => {
      const { error } = await apiClient.transport.delete(transportId);

      if (error) throw error;
    },
    onMutate: async (transportId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.transport });
      const previousTransport = queryClient.getQueryData<TransportDetails[]>(QUERY_KEYS.transport);

      queryClient.setQueryData<TransportDetails[]>(QUERY_KEYS.transport, (old = []) =>
        old.filter(t => t.id !== transportId)
      );

      return { previousTransport };
    },
    onError: (error, transportId, context) => {
      if (context?.previousTransport) {
        queryClient.setQueryData(QUERY_KEYS.transport, context.previousTransport);
      }
      
      console.error('Error removing transport:', error);
      toast({
        title: "Error Removing Transport",
        description: "Failed to remove transport from database.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transport });
      
      toast({
        title: "Transport Removed",
        description: "Transport has been removed from your schedule.",
        variant: "destructive",
      });
    },
  });

  const removeTransport = removeTransportMutation.mutate;

  // Simplified edit transport function for React Query
  const editTransport = async (transportId: string, updates: Partial<TransportDetails>) => {
    // For now, use a simple implementation that refetches data
    // This can be enhanced with optimistic updates later
    try {
      const currentTransport = transport.find(t => t.id === transportId);
      if (!currentTransport) throw new Error('Transport not found');

      const updatedTransport = { ...currentTransport, ...updates };
      const dbTransport = {
        term_id: updatedTransport.termId,
        type: updatedTransport.type,
        ...(updatedTransport.direction && { direction: updatedTransport.direction }),
        driver_name: updatedTransport.driverName,
        phone_number: updatedTransport.phoneNumber,
        license_number: updatedTransport.licenseNumber,
        pickup_time: updatedTransport.pickupTime,
        notes: updatedTransport.notes || null,
      };

      const { error } = await apiClient.transport.update(transportId, dbTransport);

      if (error) throw error;
      
      // Invalidate and refetch to get fresh data
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transport });
      
      toast({
        title: "Transport Updated",
        description: "Transport has been updated.",
      });
    } catch (error) {
      console.error('Error editing transport:', error);
      toast({
        title: "Error Updating Transport",
        description: "Failed to update transport in database.",
        variant: "destructive",
      });
    }
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
    refetch,
    // Expose mutation states
    isAddingTransport: addTransportMutation.isPending,
    isRemovingTransport: removeTransportMutation.isPending,
  };
}