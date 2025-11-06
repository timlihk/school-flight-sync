import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { NotTravellingStatus } from '@/types/school';
import { useToast } from '@/hooks/use-toast';

// Query keys for React Query
const QUERY_KEYS = {
  notTravelling: ['notTravelling'] as const,
} as const;

export function useNotTravelling() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch not travelling status with React Query
  const fetchNotTravelling = async (): Promise<NotTravellingStatus[]> => {
    const { data, error } = await apiClient.notTravelling.getAll();

    if (error) throw error;

    return data?.map((item) => ({
      id: item.id ? String(item.id) : undefined,
      termId: item.term_id,
      noFlights: item.no_flights || undefined,
      noTransport: item.no_transport || undefined,
    })) || [];
  };

  const {
    data: notTravelling = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.notTravelling,
    queryFn: fetchNotTravelling,
    staleTime: 5 * 60 * 1000, // 5 minutes - changes less frequently
  });

  React.useEffect(() => {
    if (error) {
      console.error('Error loading not travelling status:', error);
      toast({
        title: "Error Loading Status",
        description: "Failed to load travel status from database.",
        variant: "destructive",
      });
    }
  }, [error, toast]);


  // Simplified not travelling status update with invalidation
  const setNotTravellingStatus = async (termId: string, type: 'flights' | 'transport') => {
    try {
      const { error } = await apiClient.notTravelling.upsert({
        term_id: termId,
        ...(type === 'flights' ? { no_flights: true } : { no_transport: true })
      });

      if (error) throw error;

      // Invalidate and refetch to get fresh data
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notTravelling });

      toast({
        title: "Status Updated",
        description: `Marked as not requiring ${type} for this term.`,
      });
    } catch (error) {
      console.error('Error setting not travelling status:', error);
      toast({
        title: "Error Updating Status",
        description: "Failed to save travel status to database.",
        variant: "destructive",
      });
    }
  };

  const clearNotTravellingStatus = async (termId: string, type: 'flights' | 'transport') => {
    try {
      const { error } = await apiClient.notTravelling.clear(termId, { type });

      if (error) throw error;

      // Invalidate and refetch to get fresh data
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notTravelling });

      toast({
        title: "Status Cleared",
        description: `Cleared not-traveling status for ${type}.`,
      });
    } catch (error) {
      console.error('Error clearing not travelling status:', error);
      toast({
        title: "Error Clearing Status",
        description: "Failed to clear travel status.",
        variant: "destructive",
      });
    }
  };

  return {
    notTravelling,
    loading,
    setNotTravellingStatus,
    clearNotTravellingStatus,
    refetch,
  };
}
