import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNotTravelling } from './use-not-travelling';
import { apiClient } from '@/lib/api-client';
import { NotTravellingStatus } from '@/types/school';

// Mock dependencies
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    notTravelling: {
      getAll: vi.fn(),
      upsert: vi.fn(),
      clear: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useNotTravelling', () => {
  let queryClient: QueryClient;

  const mockNotTravelling: NotTravellingStatus = {
    id: 'test-nt-1',
    termId: 'term-1',
    noFlights: true,
    noTransport: false,
  };

  const mockDbNotTravelling = {
    id: 'test-nt-1',
    term_id: 'term-1',
    no_flights: true,
    no_transport: false,
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

  describe('fetching not travelling data', () => {
    it('should fetch and transform data from API', async () => {
      vi.mocked(apiClient.notTravelling.getAll).mockResolvedValue({
        data: [mockDbNotTravelling],
        error: null,
      });

      const { result } = renderHook(() => useNotTravelling(), {
        wrapper: createWrapper(),
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.notTravelling).toHaveLength(1);
      });

      expect(result.current.notTravelling[0]).toMatchObject({
        id: 'test-nt-1',
        termId: 'term-1',
        noFlights: true,
        noTransport: false,
      });
      expect(result.current.loading).toBe(false);
    });

    it('should handle empty array', async () => {
      vi.mocked(apiClient.notTravelling.getAll).mockResolvedValue({
        data: [],
        error: null,
      });

      const { result } = renderHook(() => useNotTravelling(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.notTravelling).toEqual([]);
      });
    });

    it('should handle API errors', async () => {
      vi.mocked(apiClient.notTravelling.getAll).mockResolvedValue({
        data: null,
        error: new Error('Network error'),
      });

      const { result } = renderHook(() => useNotTravelling(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.notTravelling).toEqual([]);
      });
    });
  });

  describe('setNotTravellingStatus', () => {
    it('should set not travelling status', async () => {
      vi.mocked(apiClient.notTravelling.getAll).mockResolvedValue({
        data: [],
        error: null,
      });

      vi.mocked(apiClient.notTravelling.upsert).mockResolvedValue({
        data: mockDbNotTravelling,
        error: null,
      });

      const { result } = renderHook(() => useNotTravelling(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setNotTravellingStatus('term-1');
      });

      await waitFor(() => {
        expect(apiClient.notTravelling.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            term_id: 'term-1',
            no_flights: true,
            no_transport: true,
          })
        );
      });
    });

    it('should handle partial status (flights only)', async () => {
      vi.mocked(apiClient.notTravelling.getAll).mockResolvedValue({
        data: [],
        error: null,
      });

      vi.mocked(apiClient.notTravelling.upsert).mockResolvedValue({
        data: { ...mockDbNotTravelling, no_transport: false },
        error: null,
      });

      const { result } = renderHook(() => useNotTravelling(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setNotTravellingStatus('term-1', { noFlights: true, noTransport: false });
      });

      await waitFor(() => {
        expect(apiClient.notTravelling.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            term_id: 'term-1',
            no_flights: true,
            no_transport: false,
          })
        );
      });
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(apiClient.notTravelling.getAll).mockResolvedValue({
        data: [],
        error: null,
      });

      vi.mocked(apiClient.notTravelling.upsert).mockResolvedValue({
        data: null,
        error: new Error('API Error'),
      });

      const { result } = renderHook(() => useNotTravelling(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setNotTravellingStatus('term-1');
      });

      // Should not throw, error handled gracefully
      await waitFor(() => {
        expect(apiClient.notTravelling.upsert).toHaveBeenCalled();
      });
    });
  });

  describe('clearNotTravellingStatus', () => {
    it('should clear not travelling status', async () => {
      vi.mocked(apiClient.notTravelling.getAll).mockResolvedValue({
        data: [mockDbNotTravelling],
        error: null,
      });

      vi.mocked(apiClient.notTravelling.clear).mockResolvedValue({
        data: null,
        error: null,
      });

      const { result } = renderHook(() => useNotTravelling(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.notTravelling).toHaveLength(1);
      });

      act(() => {
        result.current.clearNotTravellingStatus('term-1');
      });

      await waitFor(() => {
        expect(apiClient.notTravelling.clear).toHaveBeenCalledWith(
          'term-1',
          { type: 'both' }
        );
      });
    });

    it('should clear partial status (flights only)', async () => {
      vi.mocked(apiClient.notTravelling.getAll).mockResolvedValue({
        data: [mockDbNotTravelling],
        error: null,
      });

      vi.mocked(apiClient.notTravelling.clear).mockResolvedValue({
        data: null,
        error: null,
      });

      const { result } = renderHook(() => useNotTravelling(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.notTravelling).toHaveLength(1);
      });

      act(() => {
        result.current.clearNotTravellingStatus('term-1', 'flights');
      });

      await waitFor(() => {
        expect(apiClient.notTravelling.clear).toHaveBeenCalledWith(
          'term-1',
          { type: 'flights' }
        );
      });
    });
  });
});
