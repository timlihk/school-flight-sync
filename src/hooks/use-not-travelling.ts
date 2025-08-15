import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
    const { data, error } = await supabase
      .from('not_travelling')
      .select('*');

    if (error) throw error;

    return data?.map((item) => ({
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
      const { error } = await supabase
        .from('not_travelling')
        .upsert({
          term_id: termId,
          ...(type === 'flights' ? { no_flights: true } : { no_transport: true })
        }, {
          onConflict: 'term_id'
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
      // Get current record
      const { data: current, error: fetchError } = await supabase
        .from('not_travelling')
        .select('*')
        .eq('term_id', termId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (!current) return; // No record to update

      const updates = {
        ...(type === 'flights' ? { no_flights: false } : { no_transport: false })
      };

      const { error } = await supabase
        .from('not_travelling')
        .update(updates)
        .eq('term_id', termId);

      if (error) throw error;

      // Update local state
      setNotTravelling(prev => 
        prev.map(nt => 
          nt.termId === termId 
            ? { 
                ...nt, 
                ...(type === 'flights' ? { noFlights: undefined } : { noTransport: undefined })
              }
            : nt
        )
      );

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