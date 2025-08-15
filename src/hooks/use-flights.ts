import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FlightDetails } from '@/types/school';
import { useToast } from '@/hooks/use-toast';
import { transformFlightToDb, transformDbToFlight, transformDbFlightsArray } from '@/utils/flightTransforms';

// Query keys for React Query
const QUERY_KEYS = {
  flights: ['flights'] as const,
} as const;

export function useFlights() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch flights with React Query
  const fetchFlights = async (): Promise<FlightDetails[]> => {
    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .order('departure_date', { ascending: true });

    if (error) throw error;
    return data ? transformDbFlightsArray(data) : [];
  };

  const {
    data: flights = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.flights,
    queryFn: fetchFlights,
    staleTime: 2 * 60 * 1000, // 2 minutes for flights data
  });

  // Handle errors with useEffect to avoid rendering issues
  React.useEffect(() => {
    if (error) {
      console.error('Error loading flights:', error);
      toast({
        title: "Error Loading Flights",
        description: "Failed to load flight data from database.",
        variant: "destructive",
      });
    }
  }, [error, toast]);


  // Add flight mutation with optimistic updates
  const addFlightMutation = useMutation({
    mutationFn: async (newFlight: Omit<FlightDetails, 'id'>): Promise<FlightDetails> => {
      const dbFlight = transformFlightToDb(newFlight);
      const { data, error } = await supabase
        .from('flights')
        .insert([dbFlight])
        .select()
        .single();

      if (error) throw error;
      return transformDbToFlight(data);
    },
    onMutate: async (newFlight) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.flights });

      // Snapshot the previous value
      const previousFlights = queryClient.getQueryData<FlightDetails[]>(QUERY_KEYS.flights);

      // Optimistically update to the new value
      const optimisticFlight: FlightDetails = {
        ...newFlight,
        id: `temp-${Date.now()}`, // Temporary ID
      };
      
      queryClient.setQueryData<FlightDetails[]>(QUERY_KEYS.flights, (old = []) => [
        ...old,
        optimisticFlight,
      ]);

      return { previousFlights };
    },
    onError: (error, newFlight, context) => {
      // Revert the optimistic update
      if (context?.previousFlights) {
        queryClient.setQueryData(QUERY_KEYS.flights, context.previousFlights);
      }
      
      console.error('Error adding flight:', error);
      toast({
        title: "Error Adding Flight",
        description: "Failed to save flight to database.",
        variant: "destructive",
      });
    },
    onSuccess: (addedFlight) => {
      // Invalidate and refetch flights to get the real data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.flights });
      
      toast({
        title: "Flight Added",
        description: `${addedFlight.type === 'outbound' ? 'Outbound' : 'Return'} flight ${addedFlight.flightNumber} has been saved.`,
      });
    },
  });

  const addFlight = addFlightMutation.mutate;

  // Edit flight mutation with optimistic updates
  const editFlightMutation = useMutation({
    mutationFn: async ({ flightId, updatedFlight }: { flightId: string; updatedFlight: Omit<FlightDetails, 'id'> }): Promise<FlightDetails> => {
      const dbFlight = transformFlightToDb(updatedFlight);
      const { data, error } = await supabase
        .from('flights')
        .update(dbFlight)
        .eq('id', flightId)
        .select()
        .single();

      if (error) throw error;
      return transformDbToFlight(data);
    },
    onMutate: async ({ flightId, updatedFlight }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.flights });
      const previousFlights = queryClient.getQueryData<FlightDetails[]>(QUERY_KEYS.flights);

      // Optimistically update
      const optimisticFlight: FlightDetails = { ...updatedFlight, id: flightId };
      queryClient.setQueryData<FlightDetails[]>(QUERY_KEYS.flights, (old = []) =>
        old.map(f => f.id === flightId ? optimisticFlight : f)
      );

      return { previousFlights };
    },
    onError: (error, variables, context) => {
      if (context?.previousFlights) {
        queryClient.setQueryData(QUERY_KEYS.flights, context.previousFlights);
      }
      
      console.error('Error editing flight:', error);
      toast({
        title: "Error Updating Flight",
        description: "Failed to update flight in database.",
        variant: "destructive",
      });
    },
    onSuccess: (editedFlight) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.flights });
      
      toast({
        title: "Flight Updated",
        description: `${editedFlight.type === 'outbound' ? 'Outbound' : 'Return'} flight ${editedFlight.flightNumber} has been updated.`,
      });
    },
  });

  const editFlight = (flightId: string, updatedFlight: Omit<FlightDetails, 'id'>) => {
    editFlightMutation.mutate({ flightId, updatedFlight });
  };

  // Remove flight mutation with optimistic updates
  const removeFlightMutation = useMutation({
    mutationFn: async (flightId: string): Promise<void> => {
      const { error } = await supabase
        .from('flights')
        .delete()
        .eq('id', flightId);

      if (error) throw error;
    },
    onMutate: async (flightId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.flights });
      const previousFlights = queryClient.getQueryData<FlightDetails[]>(QUERY_KEYS.flights);

      // Optimistically remove the flight
      queryClient.setQueryData<FlightDetails[]>(QUERY_KEYS.flights, (old = []) =>
        old.filter(f => f.id !== flightId)
      );

      return { previousFlights };
    },
    onError: (error, flightId, context) => {
      if (context?.previousFlights) {
        queryClient.setQueryData(QUERY_KEYS.flights, context.previousFlights);
      }
      
      console.error('Error removing flight:', error);
      toast({
        title: "Error Removing Flight",
        description: "Failed to remove flight from database.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.flights });
      
      toast({
        title: "Flight Removed",
        description: "Flight has been removed from your schedule.",
        variant: "destructive",
      });
    },
  });

  const removeFlight = removeFlightMutation.mutate;

  const getFlightsForTerm = (termId: string) => {
    return flights.filter(flight => flight.termId === termId);
  };

  return {
    flights,
    loading,
    addFlight,
    editFlight,
    removeFlight,
    getFlightsForTerm,
    refetch,
    // Expose mutation states for better UX
    isAddingFlight: addFlightMutation.isPending,
    isEditingFlight: editFlightMutation.isPending,
    isRemovingFlight: removeFlightMutation.isPending,
  };
}