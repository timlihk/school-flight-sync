import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FlightDetails } from '@/types/school';
import { useToast } from '@/hooks/use-toast';
import { transformFlightToDb, transformDbToFlight, transformDbFlightsArray } from '@/utils/flightTransforms';
import { hybridFlightService } from '@/services/hybridFlightService';
import { convertFlightNumber } from '@/config/airlineCodes';

// Query keys for React Query
const QUERY_KEYS = {
  flights: ['flights'] as const,
  flightStatus: (flightNumber: string, date: string) => ['flightStatus', flightNumber, date] as const,
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

  // Flight status checking functionality
  const checkFlightStatus = async (flight: FlightDetails): Promise<FlightDetails> => {
    try {
      const dateStr = flight.departure.date.toISOString().split('T')[0];
      const statusResponse = await hybridFlightService.getFlightStatus(flight.flightNumber, dateStr);
      
      if (statusResponse.success && statusResponse.data) {
        const updatedFlight: FlightDetails = {
          ...flight,
          status: {
            current: statusResponse.data.status,
            actualDeparture: statusResponse.data.actualDeparture,
            actualArrival: statusResponse.data.actualArrival,
            estimatedArrival: statusResponse.data.estimatedArrival,
            gate: statusResponse.data.gate,
            terminal: statusResponse.data.terminal,
            lastUpdated: statusResponse.data.lastUpdated
          }
        };
        return updatedFlight;
      }
      return flight;
    } catch (error) {
      console.error('Error checking flight status:', error);
      return flight;
    }
  };

  // Track which flights are currently being updated to prevent double-clicks
  const [updatingFlights, setUpdatingFlights] = React.useState<Set<string>>(new Set());

  // Open FlightAware for flight status instead of API calls
  const updateFlightStatus = async (flightId: string) => {
    const flight = flights.find(f => f.id === flightId);
    if (!flight) return;

    // Prevent double-clicks
    if (updatingFlights.has(flightId)) {
      console.log('FlightAware already opening for', flightId);
      return;
    }

    // Mark as updating (briefly, just for UI feedback)
    setUpdatingFlights(prev => new Set([...prev, flightId]));

    try {
      console.log(`🌐 Opening FlightAware for ${flight.flightNumber}`);

      // Convert airline codes to FlightAware ICAO format
      const flightAwareFlightNumber = convertFlightNumber(flight.flightNumber);

      if (flightAwareFlightNumber !== flight.flightNumber) {
        console.log(`Converted ${flight.flightNumber} to ${flightAwareFlightNumber} for FlightAware`);
      }
      
      // Format date for FlightAware URL (YYYY-MM-DD)
      const flightDate = flight.departure.date.toISOString().split('T')[0];
      
      // FlightAware URL formats to try:
      // Option 1: Direct flight search with date
      // const flightAwareUrl = `https://flightaware.com/live/flight/${flightAwareFlightNumber}/${flightDate.replace(/-/g, '')}`;
      
      // Option 2: Flight finder page with prefilled search
      // const flightAwareUrl = `https://flightaware.com/live/findflight/?flight=${flightAwareFlightNumber}&date=${flightDate}`;
      
      // Option 3: Simple flight search (most reliable)
      const flightAwareUrl = `https://flightaware.com/live/flight/${flightAwareFlightNumber}`;
      
      console.log(`🔗 Opening: ${flightAwareUrl}`);
      
      // Open FlightAware in new tab
      window.open(flightAwareUrl, '_blank', 'noopener,noreferrer');
      
      toast({
        title: "Flight Status",
        description: `Opening FlightAware for ${flight.flightNumber} on ${flightDate}`,
      });
      
    } catch (error) {
      console.error('Error opening FlightAware:', error);
      toast({
        title: "Error",
        description: "Could not open FlightAware",
        variant: "destructive",
      });
    } finally {
      // Remove from updating set after brief delay for UI feedback
      setTimeout(() => {
        setUpdatingFlights(prev => {
          const newSet = new Set(prev);
          newSet.delete(flightId);
          return newSet;
        });
      }, 1000);
    }
  };

  // Auto-update flight statuses for flights within 24 hours (every 4 hours to respect API limits)
  const updateNearFlightStatuses = async () => {
    try {
      const now = new Date();
      const nearFlights = flights.filter(flight => {
        try {
          const flightTime = new Date(flight.departure.date);
          const hoursDiff = Math.abs(now.getTime() - flightTime.getTime()) / (1000 * 60 * 60);
          return hoursDiff <= 24; // Within 24 hours
        } catch (error) {
          console.error('Error processing flight date:', error, flight);
          return false;
        }
      });

      for (const flight of nearFlights) {
        try {
          const updatedFlight = await checkFlightStatus(flight);
          if (updatedFlight.status) {
            queryClient.setQueryData<FlightDetails[]>(QUERY_KEYS.flights, (old = []) =>
              old.map(f => f.id === flight.id ? updatedFlight : f)
            );
          }
        } catch (error) {
          console.error('Error updating flight status for flight:', flight.id, error);
          // Continue with next flight instead of breaking
        }
      }
    } catch (error) {
      console.error('Error in updateNearFlightStatuses:', error);
      // Don't throw the error, just log it
    }
  };


  return {
    flights,
    loading,
    addFlight,
    editFlight,
    removeFlight,
    getFlightsForTerm,
    refetch,
    // Flight status functionality
    updateFlightStatus,
    updateNearFlightStatuses,
    checkFlightStatus,
    isUpdatingFlightStatus: (flightId: string) => updatingFlights.has(flightId),
    // Expose mutation states for better UX
    isAddingFlight: addFlightMutation.isPending,
    isEditingFlight: editFlightMutation.isPending,
    isRemovingFlight: removeFlightMutation.isPending,
  };
}