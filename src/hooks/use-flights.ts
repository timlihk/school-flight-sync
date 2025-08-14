import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FlightDetails } from '@/types/school';
import { useToast } from '@/hooks/use-toast';

export function useFlights() {
  const [flights, setFlights] = useState<FlightDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load flights from database
  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    try {
      const { data, error } = await supabase
        .from('flights')
        .select('*')
        .order('departure_date', { ascending: true });

      if (error) throw error;

      // Transform database format to FlightDetails format
      const transformedFlights: FlightDetails[] = data?.map((flight) => ({
        id: flight.id,
        termId: flight.term_id,
        type: flight.type as 'outbound' | 'return',
        airline: flight.airline,
        flightNumber: flight.flight_number,
        departure: {
          airport: flight.departure_airport,
          date: new Date(flight.departure_date),
          time: flight.departure_time,
        },
        arrival: {
          airport: flight.arrival_airport,
          date: new Date(flight.arrival_date),
          time: flight.arrival_time,
        },
        confirmationCode: (flight as any).confirmation_code || undefined,
        notes: flight.notes || undefined,
      })) || [];

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
  };

  const addFlight = async (newFlight: Omit<FlightDetails, 'id'>) => {
    try {
      // Transform to database format
      const dbFlight = {
        term_id: newFlight.termId,
        type: newFlight.type,
        airline: newFlight.airline,
        flight_number: newFlight.flightNumber,
        departure_airport: newFlight.departure.airport,
        departure_date: newFlight.departure.date.toISOString().split('T')[0],
        departure_time: newFlight.departure.time,
        arrival_airport: newFlight.arrival.airport,
        arrival_date: newFlight.arrival.date.toISOString().split('T')[0],
        arrival_time: newFlight.arrival.time,
        confirmation_code: newFlight.confirmationCode || null,
        notes: newFlight.notes || null,
      };

      const { data, error } = await supabase
        .from('flights')
        .insert([dbFlight])
        .select()
        .single();

      if (error) throw error;

      // Transform back to FlightDetails format and add to state
      const addedFlight: FlightDetails = {
        id: data.id,
        termId: data.term_id,
        type: data.type as 'outbound' | 'return',
        airline: data.airline,
        flightNumber: data.flight_number,
        departure: {
          airport: data.departure_airport,
          date: new Date(data.departure_date),
          time: data.departure_time,
        },
        arrival: {
          airport: data.arrival_airport,
          date: new Date(data.arrival_date),
          time: data.arrival_time,
        },
        confirmationCode: (data as any).confirmation_code || undefined,
        notes: data.notes || undefined,
      };

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
      // Transform to database format
      const dbFlight = {
        term_id: updatedFlight.termId,
        type: updatedFlight.type,
        airline: updatedFlight.airline,
        flight_number: updatedFlight.flightNumber,
        departure_airport: updatedFlight.departure.airport,
        departure_date: updatedFlight.departure.date.toISOString().split('T')[0],
        departure_time: updatedFlight.departure.time,
        arrival_airport: updatedFlight.arrival.airport,
        arrival_date: updatedFlight.arrival.date.toISOString().split('T')[0],
        arrival_time: updatedFlight.arrival.time,
        confirmation_code: updatedFlight.confirmationCode || null,
        notes: updatedFlight.notes || null,
      };

      const { data, error } = await supabase
        .from('flights')
        .update(dbFlight)
        .eq('id', flightId)
        .select()
        .single();

      if (error) throw error;

      // Transform back to FlightDetails format and update state
      const editedFlight: FlightDetails = {
        id: data.id,
        termId: data.term_id,
        type: data.type as 'outbound' | 'return',
        airline: data.airline,
        flightNumber: data.flight_number,
        departure: {
          airport: data.departure_airport,
          date: new Date(data.departure_date),
          time: data.departure_time,
        },
        arrival: {
          airport: data.arrival_airport,
          date: new Date(data.arrival_date),
          time: data.arrival_time,
        },
        confirmationCode: (data as any).confirmation_code || undefined,
        notes: data.notes || undefined,
      };

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