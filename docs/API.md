# API Documentation

This document describes the data structures, hooks, and API patterns used in School Flight Sync.

## Overview

The application uses a combination of:
- **Supabase** for backend database operations
- **React Query** for state management and caching
- **Custom hooks** for business logic encapsulation
- **TypeScript interfaces** for type safety

## Data Models

### Core Types

#### Term
Represents an academic term or event for a school.

```typescript
interface Term {
  id: string;                    // Unique identifier
  name: string;                  // Display name (e.g., "Autumn Term 2024")
  school: 'benenden' | 'wycombe'; // School identifier
  type: TermType;                // Type of academic period
  startDate: Date;               // Term start date
  endDate: Date;                 // Term end date
  academicYear: string;          // Academic year (e.g., "2024-2025")
}

type TermType = 
  | 'term'        // Full academic term
  | 'half-term'   // Half-term break
  | 'exeat'       // Weekend leave
  | 'holiday'     // School holiday
  | 'short-leave' // Short leave period
  | 'long-leave'; // Extended leave period
```

#### FlightDetails
Stores flight booking information for a specific term.

```typescript
interface FlightDetails {
  id: string;               // Unique identifier
  termId: string;           // Associated term ID
  type: 'outbound' | 'return'; // Flight direction
  airline: string;          // Airline name
  flightNumber: string;     // Flight number
  departureAirport: string; // IATA departure airport code
  departureDate: Date;      // Departure date
  departureTime: string;    // Departure time (HH:MM format)
  arrivalAirport: string;   // IATA arrival airport code
  arrivalDate: Date;        // Arrival date
  arrivalTime: string;      // Arrival time (HH:MM format)
  confirmationCode?: string; // Booking confirmation
  notes?: string;           // Additional notes
  createdAt: Date;          // Record creation timestamp
  updatedAt: Date;          // Last update timestamp
}
```

#### TransportDetails
Manages ground transportation arrangements.

```typescript
interface TransportDetails {
  id: string;           // Unique identifier
  termId: string;       // Associated term ID
  type: 'pickup' | 'dropoff'; // Transport direction
  driverName: string;   // Driver's name
  phoneNumber: string;  // Contact phone number
  pickupTime: string;   // Pickup time (HH:MM format)
  pickupLocation: string; // Pickup address/location
  licenseNumber: string; // Driver's license number
  notes?: string;       // Additional notes
  createdAt: Date;      // Record creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

#### NotTravellingStatus
Tracks when travel arrangements aren't needed.

```typescript
interface NotTravellingStatus {
  id: string;          // Unique identifier
  termId: string;      // Associated term ID
  noFlights: boolean;  // No flights needed for this term
  noTransport: boolean; // No transport needed for this term
  createdAt: Date;     // Record creation timestamp
  updatedAt: Date;     // Last update timestamp
}
```

## Custom Hooks

### useFlights

Manages flight data operations with automatic caching and synchronization.

```typescript
interface UseFlightsReturn {
  flights: FlightDetails[];
  loading: boolean;
  error: Error | null;
  addFlight: (flight: Omit<FlightDetails, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editFlight: (id: string, updates: Partial<FlightDetails>) => Promise<void>;
  removeFlight: (id: string) => Promise<void>;
  getFlightsForTerm: (termId: string) => FlightDetails[];
}

// Usage
const { flights, loading, addFlight, editFlight, removeFlight } = useFlights();

// Add a new flight
await addFlight({
  termId: 'term-123',
  type: 'outbound',
  airline: 'British Airways',
  flightNumber: 'BA123',
  departureAirport: 'LHR',
  departureDate: new Date('2025-09-15'),
  departureTime: '14:30',
  arrivalAirport: 'JFK',
  arrivalDate: new Date('2025-09-15'),
  arrivalTime: '17:45',
  confirmationCode: 'ABC123'
});

// Edit existing flight
await editFlight('flight-456', {
  departureTime: '15:30',
  confirmationCode: 'XYZ789'
});

// Remove flight
await removeFlight('flight-456');
```

### useTransport

Handles ground transportation management.

```typescript
interface UseTransportReturn {
  transport: TransportDetails[];
  isLoading: boolean;
  error: Error | null;
  addTransport: (transport: Omit<TransportDetails, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editTransport: (id: string, updates: Partial<TransportDetails>) => Promise<void>;
  removeTransport: (id: string) => Promise<void>;
  getTransportForTerm: (termId: string) => TransportDetails[];
}

// Usage
const { transport, isLoading, addTransport, getTransportForTerm } = useTransport();

// Add transport arrangement
await addTransport({
  termId: 'term-123',
  type: 'pickup',
  driverName: 'John Smith',
  phoneNumber: '+44 7700 900123',
  pickupTime: '16:00',
  pickupLocation: 'Heathrow Terminal 5',
  licenseNumber: 'AB12 CDE',
  notes: 'Please wait in arrivals hall'
});
```

### useNotTravelling

Manages "not travelling" status for terms.

```typescript
interface UseNotTravellingReturn {
  notTravelling: NotTravellingStatus[];
  loading: boolean;
  error: Error | null;
  setNotTravellingStatus: (termId: string, type: 'flights' | 'transport') => Promise<void>;
  clearNotTravellingStatus: (termId: string, type: 'flights' | 'transport') => Promise<void>;
  getStatusForTerm: (termId: string) => NotTravellingStatus | undefined;
}

// Usage
const { notTravelling, setNotTravellingStatus } = useNotTravelling();

// Mark term as not requiring flights
await setNotTravellingStatus('term-123', 'flights');

// Mark term as not requiring transport
await setNotTravellingStatus('term-123', 'transport');
```

## Database Schema

### Tables

#### flights
```sql
CREATE TABLE public.flights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('outbound', 'return')),
  airline TEXT NOT NULL,
  flight_number TEXT NOT NULL,
  departure_airport TEXT NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TEXT NOT NULL,
  arrival_airport TEXT NOT NULL,
  arrival_date DATE NOT NULL,
  arrival_time TEXT NOT NULL,
  confirmation_code TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

#### transport
```sql
CREATE TABLE public.transport (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pickup', 'dropoff')),
  driver_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  pickup_time TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  license_number TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

#### not_travelling
```sql
CREATE TABLE public.not_travelling (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term_id TEXT NOT NULL UNIQUE,
  no_flights BOOLEAN NOT NULL DEFAULT false,
  no_transport BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### Row Level Security

All tables implement Row Level Security (RLS) with appropriate policies:

```sql
-- Enable RLS
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.not_travelling ENABLE ROW LEVEL SECURITY;

-- Create policies (example for flights table)
CREATE POLICY "Allow all operations on flights" 
ON public.flights 
FOR ALL 
USING (true)
WITH CHECK (true);
```

## Component Props Interfaces

### TermCard
```typescript
interface TermCardProps {
  term: Term;
  flights?: FlightDetails[];
  transport?: TransportDetails[];
  onAddFlight: (termId: string) => void;
  onViewFlights: (termId: string) => void;
  onAddTransport: (termId: string) => void;
  onViewTransport: (termId: string) => void;
  onSetNotTravelling: (termId: string, type: 'flights' | 'transport') => void;
  notTravellingStatus?: NotTravellingStatus;
  className?: string;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}
```

### ToDoDialog
```typescript
interface ToDoDialogProps {
  terms: Term[];
  flights: FlightDetails[];
  transport: TransportDetails[];
  notTravelling: NotTravellingStatus[];
  onAddFlight: (termId: string) => void;
  onAddTransport: (termId: string) => void;
  onShowTerm?: (termId: string) => void;
  children?: React.ReactNode;
}
```

### FlightDialog
```typescript
interface FlightDialogProps {
  term: Term;
  flights: FlightDetails[];
  onAddFlight: (flight: Omit<FlightDetails, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEditFlight: (id: string, updates: Partial<FlightDetails>) => void;
  onRemoveFlight: (id: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

## API Patterns

### Error Handling
```typescript
// Custom error types
class APIError extends Error {
  constructor(
    message: string, 
    public status: number, 
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Error handling in hooks
const { data, error, isLoading } = useQuery({
  queryKey: ['flights'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('flights')
      .select('*');
    
    if (error) {
      throw new APIError(error.message, 500, error.code);
    }
    
    return data;
  },
  retry: (failureCount, error) => {
    // Don't retry on client errors
    if (error instanceof APIError && error.status < 500) {
      return false;
    }
    return failureCount < 3;
  }
});
```

### Optimistic Updates
```typescript
const addFlightMutation = useMutation({
  mutationFn: async (newFlight: Omit<FlightDetails, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('flights')
      .insert([newFlight])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  onMutate: async (newFlight) => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['flights'] });
    
    // Snapshot the previous value
    const previousFlights = queryClient.getQueryData<FlightDetails[]>(['flights']);
    
    // Optimistically update to the new value
    queryClient.setQueryData<FlightDetails[]>(['flights'], old => [
      ...(old || []),
      { ...newFlight, id: 'temp-id', createdAt: new Date(), updatedAt: new Date() }
    ]);
    
    return { previousFlights };
  },
  onError: (err, newFlight, context) => {
    // Rollback on error
    queryClient.setQueryData(['flights'], context?.previousFlights);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['flights'] });
  }
});
```

### Data Validation
```typescript
import { z } from 'zod';

// Zod schemas for validation
const FlightSchema = z.object({
  termId: z.string().min(1, 'Term ID is required'),
  type: z.enum(['outbound', 'return']),
  airline: z.string().min(1, 'Airline is required'),
  flightNumber: z.string().min(1, 'Flight number is required'),
  departureAirport: z.string().length(3, 'Airport code must be 3 characters'),
  departureDate: z.date(),
  departureTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  arrivalAirport: z.string().length(3, 'Airport code must be 3 characters'),
  arrivalDate: z.date(),
  arrivalTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  confirmationCode: z.string().optional(),
  notes: z.string().optional()
});

// Usage in forms
const validateFlight = (data: unknown) => {
  try {
    return FlightSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError('Validation failed', 400, 'VALIDATION_ERROR');
    }
    throw error;
  }
};
```

## Utility Functions

### Date Formatting
```typescript
import { format, formatDistanceToNow } from 'date-fns';

// Format date for display
export const formatDate = (date: Date): string => {
  return format(date, 'MMM dd, yyyy');
};

// Format time for display
export const formatTime = (time: string): string => {
  return time; // Already in HH:MM format
};

// Calculate urgency based on date proximity
export const calculateUrgency = (
  targetDate: Date, 
  type: 'flight' | 'transport'
): 'high' | 'medium' | 'low' => {
  const daysUntil = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const thresholds = type === 'flight' ? { high: 30, medium: 60 } : { high: 14, medium: 30 };
  
  if (daysUntil <= thresholds.high) return 'high';
  if (daysUntil <= thresholds.medium) return 'medium';
  return 'low';
};
```

### Local Storage Utilities
```typescript
// Type-safe localStorage wrapper
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },
  
  remove(key: string): void {
    localStorage.removeItem(key);
  }
};

// Usage
const expandedCards = storage.get<string[]>('expandedCards', []);
storage.set('expandedCards', [...expandedCards, newCardId]);
```

This API documentation provides comprehensive coverage of the data structures, hooks, and patterns used throughout the School Flight Sync application. For implementation examples, refer to the actual component files in the `src/` directory.