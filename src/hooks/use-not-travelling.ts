import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NotTravellingStatus } from '@/types/school';
import { useToast } from '@/hooks/use-toast';

export function useNotTravelling() {
  const [notTravelling, setNotTravelling] = useState<NotTravellingStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load not travelling status from database
  useEffect(() => {
    loadNotTravelling();
  }, []);

  const loadNotTravelling = async () => {
    try {
      const { data, error } = await supabase
        .from('not_travelling')
        .select('*');

      if (error) throw error;

      // Transform database format to NotTravellingStatus format
      const transformedData: NotTravellingStatus[] = data?.map((item) => ({
        termId: item.term_id,
        noFlights: item.no_flights || undefined,
        noTransport: item.no_transport || undefined,
      })) || [];

      setNotTravelling(transformedData);
    } catch (error) {
      console.error('Error loading not travelling status:', error);
      toast({
        title: "Error Loading Status",
        description: "Failed to load travel status from database.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setNotTravellingStatus = async (termId: string, type: 'flights' | 'transport') => {
    try {
      // Use upsert to either insert new record or update existing one
      const { data, error } = await supabase
        .from('not_travelling')
        .upsert({
          term_id: termId,
          ...(type === 'flights' ? { no_flights: true } : { no_transport: true })
        }, {
          onConflict: 'term_id'
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setNotTravelling(prev => {
        const existing = prev.find(nt => nt.termId === termId);
        if (existing) {
          return prev.map(nt => 
            nt.termId === termId 
              ? { 
                  ...nt, 
                  ...(type === 'flights' ? { noFlights: true } : { noTransport: true })
                }
              : nt
          );
        } else {
          return [...prev, { 
            termId, 
            ...(type === 'flights' ? { noFlights: true } : { noTransport: true })
          }];
        }
      });

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
    refetch: loadNotTravelling,
  };
}