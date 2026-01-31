import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTransport } from './use-transport';
import { apiClient } from '@/lib/api-client';
import { TransportDetails } from '@/types/school';

// Mock dependencies
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    transport: {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useTransport', () => {
  let queryClient: QueryClient;

  const mockTransport: TransportDetails = {
    id: 'test-transport-1',
    termId: 'term-1',
    type: 'taxi',
    direction: 'outbound',
    driverName: 'John Driver',
    phoneNumber: '+44 123 456 7890',
    licenseNumber: 'LIC123456',
    pickupTime: '14:30',
    notes: 'Pickup from school',
  };

  const mockDbTransport = {
    id: 'test-transport-1',
    term_id: 'term-1',
    type: 'taxi',
    direction: 'outbound',
    driver_name: 'John Driver',
    phone_number: '+44 123 456 7890',
    license_number: 'LIC123456',
    pickup_time: '14:30',
    notes: 'Pickup from school',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient?.clear();
  });

  describe('fetching transport', () => {
    it('should fetch and transform transport from API', async () => {
      vi.mocked(apiClient.transport.getAll).mockResolvedValue({
        data: [mockDbTransport],
        error: null,
      });

      const { result } = renderHook(() => useTransport(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.transport).toHaveLength(1);
      });

      expect(result.current.transport[0]).toMatchObject({
        id: 'test-transport-1',
        termId: 'term-1',
        type: 'taxi',
        driverName: 'John Driver',
        phoneNumber: '+44 123 456 7890',
        direction: 'outbound',
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle transport without direction (backwards compatibility)', async () => {
      const dbTransportNoDirection = {
        ...mockDbTransport,
        direction: null,
      };

      vi.mocked(apiClient.transport.getAll).mockResolvedValue({
        data: [dbTransportNoDirection],
        error: null,
      });

      const { result } = renderHook(() => useTransport(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.transport).toHaveLength(1);
      });

      expect(result.current.transport[0].direction).toBeUndefined();
    });

    it('should handle empty transport array', async () => {
      vi.mocked(apiClient.transport.getAll).mockResolvedValue({
        data: [],
        error: null,
      });

      const { result } = renderHook(() => useTransport(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.transport).toEqual([]);
      });
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(apiClient.transport.getAll).mockResolvedValue({
        data: null,
        error: new Error('Network error'),
      });

      const { result } = renderHook(() => useTransport(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.transport).toEqual([]);
      });
    });
  });

  describe('getTransportForTerm', () => {
    it('should filter transport by term ID', async () => {
      const transport1 = { ...mockDbTransport, id: 'transport-1', term_id: 'term-a' };
      const transport2 = { ...mockDbTransport, id: 'transport-2', term_id: 'term-b' };

      vi.mocked(apiClient.transport.getAll).mockResolvedValue({
        data: [transport1, transport2],
        error: null,
      });

      const { result } = renderHook(() => useTransport(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.transport).toHaveLength(2);
      });

      const termATransport = result.current.getTransportForTerm('term-a');
      expect(termATransport).toHaveLength(1);
      expect(termATransport[0].id).toBe('transport-1');
    });

    it('should return empty array for term with no transport', async () => {
      vi.mocked(apiClient.transport.getAll).mockResolvedValue({
        data: [mockDbTransport],
        error: null,
      });

      const { result } = renderHook(() => useTransport(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.transport).toHaveLength(1);
      });

      const transport = result.current.getTransportForTerm('non-existent-term');
      expect(transport).toEqual([]);
    });
  });

  describe('addTransport', () => {
    it('should add transport with optimistic update', async () => {
      const newTransport = {
        termId: 'term-1',
        type: 'school-coach' as const,
        direction: 'return' as const,
        driverName: 'Coach Driver',
        phoneNumber: '+44 987 654 3210',
        licenseNumber: 'COACH789',
        pickupTime: '08:00',
        notes: 'Morning pickup',
      };

      const createdTransport = {
        ...mockDbTransport,
        id: 'new-transport-id',
        type: 'school-coach',
        direction: 'return',
        driver_name: 'Coach Driver',
      };

      vi.mocked(apiClient.transport.getAll).mockResolvedValue({
        data: [],
        error: null,
      });

      vi.mocked(apiClient.transport.create).mockResolvedValue({
        data: createdTransport,
        error: null,
      });

      const { result } = renderHook(() => useTransport(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addTransport(newTransport);
      });

      await waitFor(() => {
        expect(result.current.transport).toHaveLength(1);
      });

      await waitFor(() => {
        expect(apiClient.transport.create).toHaveBeenCalledWith(
          expect.objectContaining({
            term_id: 'term-1',
            type: 'school-coach',
            direction: 'return',
            driver_name: 'Coach Driver',
          })
        );
      });
    });

    it('should rollback on API error', async () => {
      const newTransport = {
        termId: 'term-1',
        type: 'taxi' as const,
        driverName: 'Test Driver',
        phoneNumber: '+44 123 456 7890',
        licenseNumber: 'LIC123',
        pickupTime: '10:00',
      };

      vi.mocked(apiClient.transport.getAll).mockResolvedValue({
        data: [],
        error: null,
      });

      vi.mocked(apiClient.transport.create).mockResolvedValue({
        data: null,
        error: new Error('API Error'),
      });

      const { result } = renderHook(() => useTransport(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addTransport(newTransport);
      });

      await waitFor(() => {
        expect(result.current.transport).toHaveLength(0);
      });
    });
  });

  describe('editTransport', () => {
    it('should update transport', async () => {
      const updates = {
        driverName: 'Updated Driver',
        phoneNumber: '+44 999 999 9999',
      };

      vi.mocked(apiClient.transport.getAll).mockResolvedValue({
        data: [mockDbTransport],
        error: null,
      });

      vi.mocked(apiClient.transport.update).mockResolvedValue({
        data: { ...mockDbTransport, driver_name: 'Updated Driver', phone_number: '+44 999 999 9999' },
        error: null,
      });

      const { result } = renderHook(() => useTransport(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.transport).toHaveLength(1);
      });

      await act(async () => {
        await result.current.editTransport('test-transport-1', updates);
      });

      expect(apiClient.transport.update).toHaveBeenCalledWith(
        'test-transport-1',
        expect.objectContaining({
          driver_name: 'Updated Driver',
          phone_number: '+44 999 999 9999',
        })
      );
    });

    it('should handle edit errors gracefully', async () => {
      vi.mocked(apiClient.transport.getAll).mockResolvedValue({
        data: [mockDbTransport],
        error: null,
      });

      vi.mocked(apiClient.transport.update).mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useTransport(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.transport).toHaveLength(1);
      });

      await act(async () => {
        await result.current.editTransport('test-transport-1', { driverName: 'New Name' });
      });

      // Should still have original data
      expect(result.current.transport[0].driverName).toBe('John Driver');
    });
  });

  describe('removeTransport', () => {
    it('should remove transport with optimistic update', async () => {
      vi.mocked(apiClient.transport.getAll).mockResolvedValue({
        data: [mockDbTransport],
        error: null,
      });

      vi.mocked(apiClient.transport.delete).mockResolvedValue({
        data: null,
        error: null,
      });

      const { result } = renderHook(() => useTransport(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.transport).toHaveLength(1);
      });

      act(() => {
        result.current.removeTransport('test-transport-1');
      });

      await waitFor(() => {
        expect(result.current.transport).toHaveLength(0);
      });

      expect(apiClient.transport.delete).toHaveBeenCalledWith('test-transport-1');
    });

    it('should rollback on API error', async () => {
      vi.mocked(apiClient.transport.getAll).mockResolvedValue({
        data: [mockDbTransport],
        error: null,
      });

      vi.mocked(apiClient.transport.delete).mockResolvedValue({
        data: null,
        error: new Error('Delete failed'),
      });

      const { result } = renderHook(() => useTransport(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.transport).toHaveLength(1);
      });

      act(() => {
        result.current.removeTransport('test-transport-1');
      });

      // Should rollback to original state
      await waitFor(() => {
        expect(result.current.transport).toHaveLength(1);
      });
    });
  });

  describe('mutation state tracking', () => {
    it('should track adding state', async () => {
      vi.mocked(apiClient.transport.getAll).mockResolvedValue({
        data: [],
        error: null,
      });

      // Delay the create to test loading state
      vi.mocked(apiClient.transport.create).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: mockDbTransport, error: null }), 100))
      );

      const { result } = renderHook(() => useTransport(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAddingTransport).toBe(false);

      act(() => {
        result.current.addTransport({
          termId: 'term-1',
          type: 'taxi',
          driverName: 'Test',
          phoneNumber: '+44 123 456 7890',
          licenseNumber: 'LIC',
          pickupTime: '10:00',
        });
      });

      expect(result.current.isAddingTransport).toBe(true);
    });

    it('should track removing state', async () => {
      vi.mocked(apiClient.transport.getAll).mockResolvedValue({
        data: [mockDbTransport],
        error: null,
      });

      vi.mocked(apiClient.transport.delete).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: null, error: null }), 100))
      );

      const { result } = renderHook(() => useTransport(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.transport).toHaveLength(1);
      });

      expect(result.current.isRemovingTransport).toBe(false);

      act(() => {
        result.current.removeTransport('test-transport-1');
      });

      expect(result.current.isRemovingTransport).toBe(true);
    });
  });
});
