import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFlights } from './use-flights';
import { apiClient } from '@/lib/api-client';
import { FlightDetails } from '@/types/school';

// Mock dependencies
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    flights: {
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

// Mock window.open for FlightAware tests
Object.defineProperty(window, 'open', {
  writable: true,
  value: vi.fn(),
});

describe('useFlights', () => {
  let queryClient: QueryClient;

  const mockFlight: FlightDetails = {
    id: 'test-flight-1',
    termId: 'term-1',
    type: 'outbound',
    airline: 'Cathay Pacific',
    flightNumber: 'CX238',
    departure: {
      airport: 'LHR',
      date: new Date('2025-09-02'),
      time: '12:00',
    },
    arrival: {
      airport: 'HKG',
      date: new Date('2025-09-03'),
      time: '06:00',
    },
    confirmationCode: 'ABC123',
    notes: 'Test flight notes',
  };

  const mockDbFlight = {
    id: 'test-flight-1',
    term_id: 'term-1',
    type: 'outbound',
    airline: 'Cathay Pacific',
    flight_number: 'CX238',
    departure_airport: 'LHR',
    departure_date: '2025-09-02',
    departure_time: '12:00',
    arrival_airport: 'HKG',
    arrival_date: '2025-09-03',
    arrival_time: '06:00',
    confirmation_code: 'ABC123',
    notes: 'Test flight notes',
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

  describe('fetching flights', () => {
    it('should fetch and transform flights from API', async () => {
      vi.mocked(apiClient.flights.getAll).mockResolvedValue({
        data: [mockDbFlight],
        error: null,
      });

      const { result } = renderHook(() => useFlights(), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.loading).toBe(true);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.flights).toHaveLength(1);
      });

      expect(result.current.flights[0]).toMatchObject({
        id: 'test-flight-1',
        termId: 'term-1',
        flightNumber: 'CX238',
        airline: 'Cathay Pacific',
      });
      expect(result.current.loading).toBe(false);
    });

    it('should handle empty flights array', async () => {
      vi.mocked(apiClient.flights.getAll).mockResolvedValue({
        data: [],
        error: null,
      });

      const { result } = renderHook(() => useFlights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.flights).toEqual([]);
      });
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(apiClient.flights.getAll).mockResolvedValue({
        data: null,
        error: new Error('Network error'),
      });

      const { result } = renderHook(() => useFlights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.flights).toEqual([]);
      });
    });
  });

  describe('getFlightsForTerm', () => {
    it('should filter flights by term ID', async () => {
      const flight1 = { ...mockDbFlight, id: 'flight-1', term_id: 'term-a' };
      const flight2 = { ...mockDbFlight, id: 'flight-2', term_id: 'term-b' };

      vi.mocked(apiClient.flights.getAll).mockResolvedValue({
        data: [flight1, flight2],
        error: null,
      });

      const { result } = renderHook(() => useFlights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.flights).toHaveLength(2);
      });

      const termAFlights = result.current.getFlightsForTerm('term-a');
      expect(termAFlights).toHaveLength(1);
      expect(termAFlights[0].id).toBe('flight-1');
    });
  });

  describe('addFlight', () => {
    it('should add a flight with optimistic update', async () => {
      const newFlight = {
        termId: 'term-1',
        type: 'outbound' as const,
        airline: 'British Airways',
        flightNumber: 'BA31',
        departure: {
          airport: 'LHR',
          date: new Date('2025-09-02'),
          time: '14:00',
        },
        arrival: {
          airport: 'HKG',
          date: new Date('2025-09-03'),
          time: '08:00',
        },
      };

      const createdFlight = {
        ...mockDbFlight,
        id: 'new-flight-id',
        flight_number: 'BA31',
        airline: 'British Airways',
      };

      vi.mocked(apiClient.flights.getAll).mockResolvedValue({
        data: [],
        error: null,
      });

      vi.mocked(apiClient.flights.create).mockResolvedValue({
        data: createdFlight,
        error: null,
      });

      const { result } = renderHook(() => useFlights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Add flight
      act(() => {
        result.current.addFlight(newFlight);
      });

      // Optimistic update should show flight immediately
      await waitFor(() => {
        expect(result.current.flights).toHaveLength(1);
      });

      // Wait for mutation to complete
      await waitFor(() => {
        expect(apiClient.flights.create).toHaveBeenCalled();
      });
    });

    it('should rollback on API error', async () => {
      const newFlight = {
        termId: 'term-1',
        type: 'outbound' as const,
        airline: 'British Airways',
        flightNumber: 'BA31',
        departure: {
          airport: 'LHR',
          date: new Date('2025-09-02'),
          time: '14:00',
        },
        arrival: {
          airport: 'HKG',
          date: new Date('2025-09-03'),
          time: '08:00',
        },
      };

      vi.mocked(apiClient.flights.getAll).mockResolvedValue({
        data: [],
        error: null,
      });

      vi.mocked(apiClient.flights.create).mockResolvedValue({
        data: null,
        error: new Error('API Error'),
      });

      const { result } = renderHook(() => useFlights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.addFlight(newFlight);
      });

      // Should rollback to empty after error
      await waitFor(() => {
        expect(result.current.flights).toHaveLength(0);
      });
    });
  });

  describe('editFlight', () => {
    it('should update flight with optimistic update', async () => {
      const updatedFlight = {
        termId: 'term-1',
        type: 'outbound' as const,
        airline: 'Updated Airline',
        flightNumber: 'CX238',
        departure: {
          airport: 'LHR',
          date: new Date('2025-09-02'),
          time: '12:00',
        },
        arrival: {
          airport: 'HKG',
          date: new Date('2025-09-03'),
          time: '06:00',
        },
      };

      vi.mocked(apiClient.flights.getAll).mockResolvedValue({
        data: [mockDbFlight],
        error: null,
      });

      vi.mocked(apiClient.flights.update).mockResolvedValue({
        data: { ...mockDbFlight, airline: 'Updated Airline' },
        error: null,
      });

      const { result } = renderHook(() => useFlights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.flights).toHaveLength(1);
      });

      act(() => {
        result.current.editFlight('test-flight-1', updatedFlight);
      });

      await waitFor(() => {
        expect(apiClient.flights.update).toHaveBeenCalledWith(
          'test-flight-1',
          expect.objectContaining({ airline: 'Updated Airline' })
        );
      });
    });
  });

  describe('removeFlight', () => {
    it('should remove flight with optimistic update', async () => {
      vi.mocked(apiClient.flights.getAll).mockResolvedValue({
        data: [mockDbFlight],
        error: null,
      });

      vi.mocked(apiClient.flights.delete).mockResolvedValue({
        data: null,
        error: null,
      });

      const { result } = renderHook(() => useFlights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.flights).toHaveLength(1);
      });

      act(() => {
        result.current.removeFlight('test-flight-1');
      });

      await waitFor(() => {
        expect(result.current.flights).toHaveLength(0);
      });

      expect(apiClient.flights.delete).toHaveBeenCalledWith('test-flight-1');
    });
  });

  describe('updateFlightStatus', () => {
    it('should open FlightAware with converted flight number', async () => {
      vi.mocked(apiClient.flights.getAll).mockResolvedValue({
        data: [mockDbFlight],
        error: null,
      });

      const { result } = renderHook(() => useFlights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.flights).toHaveLength(1);
      });

      await act(async () => {
        await result.current.updateFlightStatus('test-flight-1');
      });

      expect(window.open).toHaveBeenCalledWith(
        'https://flightaware.com/live/flight/CPA238',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('should prevent double-clicks', async () => {
      vi.mocked(apiClient.flights.getAll).mockResolvedValue({
        data: [mockDbFlight],
        error: null,
      });

      const { result } = renderHook(() => useFlights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.flights).toHaveLength(1);
      });

      // First click
      await act(async () => {
        await result.current.updateFlightStatus('test-flight-1');
      });

      // Second click should be ignored
      await act(async () => {
        await result.current.updateFlightStatus('test-flight-1');
      });

      // window.open should only be called once
      expect(window.open).toHaveBeenCalledTimes(1);
    });
  });

  describe('isUpdatingFlightStatus', () => {
    it('should track updating state', async () => {
      vi.mocked(apiClient.flights.getAll).mockResolvedValue({
        data: [mockDbFlight],
        error: null,
      });

      const { result } = renderHook(() => useFlights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.flights).toHaveLength(1);
      });

      expect(result.current.isUpdatingFlightStatus('test-flight-1')).toBe(false);

      act(() => {
        result.current.updateFlightStatus('test-flight-1');
      });

      // Should be updating immediately after click
      expect(result.current.isUpdatingFlightStatus('test-flight-1')).toBe(true);
    });
  });
});
