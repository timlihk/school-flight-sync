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
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform database format to TransportDetails format
      const transformedTransport: TransportDetails[] = data?.map((transport) => ({
        id: transport.id,
        termId: transport.term_id,
        type: transport.type as 'school-coach' | 'taxi',
        driverName: transport.driver_name,
        phoneNumber: transport.phone_number,
        licenseNumber: transport.license_number,
        pickupTime: transport.pickup_time,
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
        driver_name: newTransport.driverName,
        phone_number: newTransport.phoneNumber,
        license_number: newTransport.licenseNumber,
        pickup_time: newTransport.pickupTime,
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
        type: data.type as 'school-coach' | 'taxi',
        driverName: data.driver_name,
        phoneNumber: data.phone_number,
        licenseNumber: data.license_number,
        pickupTime: data.pickup_time,
        notes: data.notes || undefined,
      };

      setTransport(prev => [...prev, addedTransport]);
      
      toast({
        title: "Transport Added",
        description: `${addedTransport.type === 'school-coach' ? 'School coach' : 'Taxi'} transport has been saved.`,
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
        driver_name: updatedTransport.driverName,
        phone_number: updatedTransport.phoneNumber,
        license_number: updatedTransport.licenseNumber,
        pickup_time: updatedTransport.pickupTime,
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
        type: data.type as 'school-coach' | 'taxi',
        driverName: data.driver_name,
        phoneNumber: data.phone_number,
        licenseNumber: data.license_number,
        pickupTime: data.pickup_time,
        notes: data.notes || undefined,
      };

      setTransport(prev => prev.map(t => t.id === transportId ? editedTransport : t));
      
      toast({
        title: "Transport Updated",
        description: `${editedTransport.type === 'school-coach' ? 'School coach' : 'Taxi'} transport has been updated.`,
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