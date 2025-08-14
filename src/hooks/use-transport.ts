import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TransportDetails } from '@/types/school';
import { useToast } from '@/hooks/use-toast';

export function useTransport() {
  const [transport, setTransport] = useState<TransportDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load transport from database
  useEffect(() => {
    loadTransport();
  }, []);

  const loadTransport = async () => {
    try {
      const { data, error } = await supabase
        .from('transport')
        .select('*')
        .order('departure_date', { ascending: true });

      if (error) throw error;

      // Transform database format to TransportDetails format
      const transformedTransport: TransportDetails[] = data?.map((transport) => ({
        id: transport.id,
        termId: transport.term_id,
        type: transport.type as 'to_school' | 'from_school',
        method: transport.method as 'car' | 'train' | 'other',
        departure: {
          location: transport.departure_location || '',
          date: new Date(transport.departure_date),
          time: transport.departure_time || '',
        },
        arrival: {
          location: transport.arrival_location || '',
          date: transport.arrival_date ? new Date(transport.arrival_date) : new Date(transport.departure_date),
          time: transport.arrival_time || '',
        },
        notes: transport.notes || undefined,
      })) || [];

      setTransport(transformedTransport);
    } catch (error) {
      console.error('Error loading transport:', error);
      toast({
        title: "Error Loading Transport",
        description: "Failed to load transport data from database.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTransport = async (newTransport: Omit<TransportDetails, 'id'>) => {
    try {
      // Transform to database format
      const dbTransport = {
        term_id: newTransport.termId,
        type: newTransport.type,
        method: newTransport.method,
        departure_location: newTransport.departure.location,
        departure_date: newTransport.departure.date.toISOString().split('T')[0],
        departure_time: newTransport.departure.time,
        arrival_location: newTransport.arrival.location,
        arrival_date: newTransport.arrival.date.toISOString().split('T')[0],
        arrival_time: newTransport.arrival.time,
        notes: newTransport.notes || null,
      };

      const { data, error } = await supabase
        .from('transport')
        .insert([dbTransport])
        .select()
        .single();

      if (error) throw error;

      // Transform back to TransportDetails format and add to state
      const addedTransport: TransportDetails = {
        id: data.id,
        termId: data.term_id,
        type: data.type as 'to_school' | 'from_school',
        method: data.method as 'car' | 'train' | 'other',
        departure: {
          location: data.departure_location || '',
          date: new Date(data.departure_date),
          time: data.departure_time || '',
        },
        arrival: {
          location: data.arrival_location || '',
          date: data.arrival_date ? new Date(data.arrival_date) : new Date(data.departure_date),
          time: data.arrival_time || '',
        },
        notes: data.notes || undefined,
      };

      setTransport(prev => [...prev, addedTransport]);
      
      toast({
        title: "Transport Added",
        description: `${addedTransport.type === 'to_school' ? 'To school' : 'From school'} transport has been saved.`,
      });

      return addedTransport;
    } catch (error) {
      console.error('Error adding transport:', error);
      toast({
        title: "Error Adding Transport",
        description: "Failed to save transport to database.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeTransport = async (transportId: string) => {
    try {
      const { error } = await supabase
        .from('transport')
        .delete()
        .eq('id', transportId);

      if (error) throw error;

      setTransport(prev => prev.filter(t => t.id !== transportId));
      
      toast({
        title: "Transport Removed",
        description: "Transport has been removed from your schedule.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error removing transport:', error);
      toast({
        title: "Error Removing Transport",
        description: "Failed to remove transport from database.",
        variant: "destructive",
      });
    }
  };

  const editTransport = async (transportId: string, updates: Partial<TransportDetails>) => {
    try {
      // Get the current transport data to merge with updates
      const currentTransport = transport.find(t => t.id === transportId);
      if (!currentTransport) throw new Error('Transport not found');

      const updatedTransport = { ...currentTransport, ...updates };

      // Transform to database format
      const dbTransport = {
        term_id: updatedTransport.termId,
        type: updatedTransport.type,
        method: updatedTransport.method,
        departure_location: updatedTransport.departure.location,
        departure_date: updatedTransport.departure.date.toISOString().split('T')[0],
        departure_time: updatedTransport.departure.time,
        arrival_location: updatedTransport.arrival.location,
        arrival_date: updatedTransport.arrival.date.toISOString().split('T')[0],
        arrival_time: updatedTransport.arrival.time,
        notes: updatedTransport.notes || null,
      };

      const { data, error } = await supabase
        .from('transport')
        .update(dbTransport)
        .eq('id', transportId)
        .select()
        .single();

      if (error) throw error;

      // Transform back to TransportDetails format and update state
      const editedTransport: TransportDetails = {
        id: data.id,
        termId: data.term_id,
        type: data.type as 'to_school' | 'from_school',
        method: data.method as 'car' | 'train' | 'other',
        departure: {
          location: data.departure_location || '',
          date: new Date(data.departure_date),
          time: data.departure_time || '',
        },
        arrival: {
          location: data.arrival_location || '',
          date: data.arrival_date ? new Date(data.arrival_date) : new Date(data.departure_date),
          time: data.arrival_time || '',
        },
        notes: data.notes || undefined,
      };

      setTransport(prev => prev.map(t => t.id === transportId ? editedTransport : t));
      
      toast({
        title: "Transport Updated",
        description: `${editedTransport.type === 'to_school' ? 'To school' : 'From school'} transport has been updated.`,
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
    refetch: loadTransport,
  };
}