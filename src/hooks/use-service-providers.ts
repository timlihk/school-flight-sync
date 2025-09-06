import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceProvider } from '@/types/school';
import { useToast } from '@/hooks/use-toast';

// Query keys for React Query
const QUERY_KEYS = {
  serviceProviders: ['serviceProviders'] as const,
} as const;

export function useServiceProviders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch service providers with React Query
  const fetchServiceProviders = async (): Promise<ServiceProvider[]> => {
    const { data, error } = await supabase
      .from('service_providers')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;

    // Transform database format to ServiceProvider format
    return data?.map((provider) => ({
      id: provider.id,
      name: provider.name,
      phoneNumber: provider.phone_number,
      licenseNumber: provider.license_number,
      vehicleType: provider.vehicle_type as 'school-coach' | 'taxi',
      email: provider.email,
      notes: provider.notes,
      rating: provider.rating,
      isActive: provider.is_active,
      createdAt: provider.created_at,
      updatedAt: provider.updated_at,
    })) || [];
  };

  const {
    data: serviceProviders = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.serviceProviders,
    queryFn: fetchServiceProviders,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  React.useEffect(() => {
    if (error) {
      console.error('Error loading service providers:', error);
      toast({
        title: "Error Loading Service Providers",
        description: "Failed to load service provider data from database.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Add service provider mutation
  const addServiceProviderMutation = useMutation({
    mutationFn: async (newProvider: Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceProvider> => {
      const dbProvider = {
        name: newProvider.name,
        phone_number: newProvider.phoneNumber,
        license_number: newProvider.licenseNumber,
        vehicle_type: newProvider.vehicleType,
        email: newProvider.email,
        notes: newProvider.notes,
        rating: newProvider.rating,
        is_active: newProvider.isActive,
      };

      const { data, error } = await supabase
        .from('service_providers')
        .insert([dbProvider])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        phoneNumber: data.phone_number,
        licenseNumber: data.license_number,
        vehicleType: data.vehicle_type as 'school-coach' | 'taxi',
        email: data.email,
        notes: data.notes,
        rating: data.rating,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    },
    onMutate: async (newProvider) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.serviceProviders });
      const previousProviders = queryClient.getQueryData<ServiceProvider[]>(QUERY_KEYS.serviceProviders);

      const optimisticProvider: ServiceProvider = {
        ...newProvider,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      queryClient.setQueryData<ServiceProvider[]>(QUERY_KEYS.serviceProviders, (old = []) => [
        ...old,
        optimisticProvider,
      ]);

      return { previousProviders };
    },
    onError: (error, newProvider, context) => {
      if (context?.previousProviders) {
        queryClient.setQueryData(QUERY_KEYS.serviceProviders, context.previousProviders);
      }
      
      console.error('Error adding service provider:', error);
      toast({
        title: "Error Adding Service Provider",
        description: "Failed to save service provider to database.",
        variant: "destructive",
      });
    },
    onSuccess: (addedProvider) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.serviceProviders });
      
      toast({
        title: "Service Provider Added",
        description: `${addedProvider.name} has been added to your service providers.`,
      });
      
      return addedProvider;
    },
  });

  const addServiceProvider = (newProvider: Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt'>) => {
    return addServiceProviderMutation.mutateAsync(newProvider);
  };

  // Update service provider mutation
  const updateServiceProvider = async (providerId: string, updates: Partial<ServiceProvider>) => {
    try {
      const currentProvider = serviceProviders.find(p => p.id === providerId);
      if (!currentProvider) throw new Error('Service provider not found');

      const updatedProvider = { ...currentProvider, ...updates };
      const dbProvider = {
        name: updatedProvider.name,
        phone_number: updatedProvider.phoneNumber,
        license_number: updatedProvider.licenseNumber,
        vehicle_type: updatedProvider.vehicleType,
        email: updatedProvider.email,
        notes: updatedProvider.notes,
        rating: updatedProvider.rating,
        is_active: updatedProvider.isActive,
      };

      const { error } = await supabase
        .from('service_providers')
        .update(dbProvider)
        .eq('id', providerId);

      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.serviceProviders });
      
      toast({
        title: "Service Provider Updated",
        description: "Service provider has been updated.",
      });
    } catch (error) {
      console.error('Error updating service provider:', error);
      toast({
        title: "Error Updating Service Provider",
        description: "Failed to update service provider in database.",
        variant: "destructive",
      });
    }
  };

  // Soft delete service provider
  const deactivateServiceProvider = async (providerId: string) => {
    try {
      await updateServiceProvider(providerId, { isActive: false });
      
      toast({
        title: "Service Provider Deactivated",
        description: "Service provider has been deactivated.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error deactivating service provider:', error);
    }
  };

  // Get providers by vehicle type
  const getProvidersByType = (vehicleType: 'school-coach' | 'taxi') => {
    return serviceProviders.filter(p => p.vehicleType === vehicleType && p.isActive);
  };

  // Search providers by name
  const searchProviders = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return serviceProviders.filter(p => 
      p.isActive && 
      (p.name.toLowerCase().includes(lowercaseQuery) ||
       p.phoneNumber.includes(query) ||
       (p.licenseNumber && p.licenseNumber.toLowerCase().includes(lowercaseQuery)))
    );
  };

  return {
    serviceProviders,
    isLoading,
    addServiceProvider,
    updateServiceProvider,
    deactivateServiceProvider,
    getProvidersByType,
    searchProviders,
    refetch,
    // Expose mutation states
    isAddingProvider: addServiceProviderMutation.isPending,
  };
}