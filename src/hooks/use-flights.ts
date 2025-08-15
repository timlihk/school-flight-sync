import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FlightDetails } from '@/types/school';
import { useToast } from '@/hooks/use-toast';
import { transformFlightToDb, transformDbToFlight, transformDbFlightsArray } from '@/utils/flightTransforms';

export function useFlights() {
  const [flights, setFlights] = useState<FlightDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load flights from database
  const loadFlights = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('flights')
        .select('*')
        .order('departure_date', { ascending: true });

      if (error) throw error;

      // Use utility function to transform database format to FlightDetails format
      const transformedFlights = data ? transformDbFlightsArray(data) : [];
      setFlights(transformedFlights);
    } catch (error) {
      console.error('Error loading flights:', error);
      toast({
        title: "Error Loading Flights",
        description: "Failed to load flight data from database.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadFlights();
  }, [loadFlights]);


  const addFlight = async (newFlight: Omit<FlightDetails, 'id'>) => {
    try {
      // Use utility function to transform to database format
      const dbFlight = transformFlightToDb(newFlight);

      const { data, error } = await supabase
        .from('flights')
        .insert([dbFlight])
        .select()
        .single();

      if (error) throw error;

      // Use utility function to transform back to FlightDetails format
      const addedFlight = transformDbToFlight(data);
      setFlights(prev => [...prev, addedFlight]);
      
      toast({
        title: "Flight Added",
        description: `${addedFlight.type === 'outbound' ? 'Outbound' : 'Return'} flight ${addedFlight.flightNumber} has been saved.`,
      });
    } catch (error) {
      console.error('Error adding flight:', error);
      toast({
        title: "Error Adding Flight",
        description: "Failed to save flight to database.",
        variant: "destructive",
      });
    }
  };

  const editFlight = async (flightId: string, updatedFlight: Omit<FlightDetails, 'id'>) => {
    try {
      // Use utility function to transform to database format
      const dbFlight = transformFlightToDb(updatedFlight);

      const { data, error } = await supabase
        .from('flights')
        .update(dbFlight)
        .eq('id', flightId)
        .select()
        .single();

      if (error) throw error;

      // Use utility function to transform back to FlightDetails format
      const editedFlight = transformDbToFlight(data);
      setFlights(prev => prev.map(f => f.id === flightId ? editedFlight : f));
      
      toast({
        title: "Flight Updated",
        description: `${editedFlight.type === 'outbound' ? 'Outbound' : 'Return'} flight ${editedFlight.flightNumber} has been updated.`,
      });
    } catch (error) {
      console.error('Error editing flight:', error);
      toast({
        title: "Error Updating Flight",
        description: "Failed to update flight in database.",
        variant: "destructive",
      });
    }
  };

  const removeFlight = async (flightId: string) => {
    try {
      const { error } = await supabase
        .from('flights')
        .delete()
        .eq('id', flightId);

      if (error) throw error;

      setFlights(prev => prev.filter(f => f.id !== flightId));
      
      toast({
        title: "Flight Removed",
        description: "Flight has been removed from your schedule.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error removing flight:', error);
      toast({
        title: "Error Removing Flight",
        description: "Failed to remove flight from database.",
        variant: "destructive",
      });
    }
  };

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
    refetch: loadFlights,
  };
}