import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FlightDetails } from '@/types/school';
import { useToast } from '@/hooks/use-toast';
import { transformFlightToDb, transformDbToFlight, transformDbFlightsArray } from '@/utils/flightTransforms';
import { hybridFlightService } from '@/services/hybridFlightService';
import { flightCorrectionService } from '@/services/flightCorrectionService';

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

  // Update flight with status information and propagate to similar flights
  const updateFlightStatus = async (flightId: string) => {
    const flight = flights.find(f => f.id === flightId);
    if (!flight) return;

    // Prevent double-clicks
    if (updatingFlights.has(flightId)) {
      console.log('Flight status update already in progress for', flightId);
      return;
    }

    // Mark as updating
    setUpdatingFlights(prev => new Set([...prev, flightId]));

    try {
      const updatedFlight = await checkFlightStatus(flight);
      
      if (updatedFlight.status) {
        // Find all flights with same flight number and similar date
        const similarFlights = flights.filter(f => 
          f.flightNumber === flight.flightNumber &&
          f.departure.date.toDateString() === flight.departure.date.toDateString()
        );

        console.log(`📊 Updating status for ${flight.flightNumber} and ${similarFlights.length - 1} similar flight(s)`);

        // Update all similar flights in the cache
        queryClient.setQueryData<FlightDetails[]>(QUERY_KEYS.flights, (old = []) =>
          old.map(f => {
            // Update flights with same flight number and date
            if (f.flightNumber === flight.flightNumber && 
                f.departure.date.toDateString() === flight.departure.date.toDateString()) {
              return {
                ...f,
                status: updatedFlight.status
              };
            }
            return f;
          })
        );

        toast({
          title: "Flight Status Updated",
          description: similarFlights.length > 1 
            ? `${updatedFlight.flightNumber} is ${updatedFlight.status.current} (updated ${similarFlights.length} flights)`
            : `${updatedFlight.flightNumber} is ${updatedFlight.status.current}`,
        });
      } else {
        // Still update the specific flight even if no status found
        queryClient.setQueryData<FlightDetails[]>(QUERY_KEYS.flights, (old = []) =>
          old.map(f => f.id === flightId ? updatedFlight : f)
        );

        toast({
          title: "Status Check Complete",
          description: `No status update available for ${flight.flightNumber}`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Flight status update error:', error);
      toast({
        title: "Status Update Failed",
        description: "Could not update flight status",
        variant: "destructive",
      });
    } finally {
      // Remove from updating set
      setUpdatingFlights(prev => {
        const newSet = new Set(prev);
        newSet.delete(flightId);
        return newSet;
      });
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

  // Apply manual correction to flight data and update related entries
  const applyFlightCorrection = async (
    flightNumber: string,
    originalDate: string, 
    correctedFlight: FlightDetails
  ) => {
    try {
      const stats = await flightCorrectionService.applyManualCorrection(
        flightNumber,
        originalDate,
        correctedFlight
      );

      // Refresh flights data to reflect database updates
      if (stats.databaseFlightsUpdated > 0) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.flights });
      }

      return stats;
    } catch (error) {
      console.error('Error applying flight correction:', error);
      throw error;
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
    // Flight correction functionality
    applyFlightCorrection,
    // Expose mutation states for better UX
    isAddingFlight: addFlightMutation.isPending,
    isEditingFlight: editFlightMutation.isPending,
    isRemovingFlight: removeFlightMutation.isPending,
  };
}