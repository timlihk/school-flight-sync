import { z } from 'zod';

// Flight validation schemas
export const createFlightSchema = z.object({
  term_id: z.string().min(1, 'Term ID is required'),
  type: z.enum(['outbound', 'return'], {
    message: 'Type must be either "outbound" or "return"'
  }),
  airline: z.string().min(1, 'Airline is required'),
  flight_number: z.string().min(1, 'Flight number is required'),
  departure_airport: z.string().min(1, 'Departure airport is required'),
  departure_date: z.string().min(1, 'Departure date is required'),
  departure_time: z.string().regex(/^\d{1,2}:\d{2}$/, 'Departure time must be in HH:MM format'),
  arrival_airport: z.string().min(1, 'Arrival airport is required'),
  arrival_date: z.string().min(1, 'Arrival date is required'),
  arrival_time: z.string().regex(/^\d{1,2}:\d{2}$/, 'Arrival time must be in HH:MM format'),
  confirmation_code: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateFlightSchema = createFlightSchema.partial();

// Transport validation schemas
export const createTransportSchema = z.object({
  term_id: z.string().min(1, 'Term ID is required'),
  type: z.enum(['school-coach', 'taxi'], {
    message: 'Type must be either "school-coach" or "taxi"'
  }),
  direction: z.enum(['outbound', 'return'], {
    message: 'Direction must be either "outbound" or "return"'
  }),
  driver_name: z.string().optional(),
  phone_number: z.string().optional(),
  license_number: z.string().optional(),
  pickup_time: z.string().min(1, 'Pickup time is required'),
  notes: z.string().nullable().optional(),
}).refine((data) => {
  // For school-coach, only pickup_time is required
  // For taxi, all fields are required
  if (data.type === 'taxi') {
    return data.driver_name && data.driver_name.length > 0 &&
           data.phone_number && data.phone_number.length > 0 &&
           data.license_number && data.license_number.length > 0;
  }
  return true;
}, {
  message: 'For taxi transport, driver name, phone number, and license number are required',
  path: ['driver_name']
});

export const updateTransportSchema = createTransportSchema.partial();

// Service Provider validation schemas
export const createServiceProviderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone_number: z.string().min(1, 'Phone number is required'),
  license_number: z.string().nullable().optional(),
  vehicle_type: z.enum(['school-coach', 'taxi'], {
    message: 'Vehicle type must be either "school-coach" or "taxi"'
  }),
  email: z.string().email('Invalid email address').nullable().optional(),
  notes: z.string().nullable().optional(),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5').nullable().optional(),
  is_active: z.boolean().optional().default(true),
});

export const updateServiceProviderSchema = createServiceProviderSchema.partial();

// Not Travelling validation schemas
export const upsertNotTravellingSchema = z.object({
  term_id: z.string().min(1, 'Term ID is required'),
  no_flights: z.boolean().optional(),
  no_transport: z.boolean().optional(),
});

export const clearNotTravellingSchema = z.object({
  type: z.enum(['flights', 'transport', 'both']).optional(),
});

// UUID validation helper
export const uuidSchema = z.string().uuid('Invalid UUID format');
