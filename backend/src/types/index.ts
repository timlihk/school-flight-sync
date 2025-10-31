// Database types matching the schema
export interface Flight {
  id: string;
  term_id: string;
  type: 'outbound' | 'return';
  airline: string;
  flight_number: string;
  departure_airport: string;
  departure_date: string;
  departure_time: string;
  arrival_airport: string;
  arrival_date: string;
  arrival_time: string;
  confirmation_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transport {
  id: string;
  term_id: string;
  type: 'school-coach' | 'taxi';
  direction: 'outbound' | 'return';
  driver_name: string;
  phone_number: string;
  license_number: string;
  pickup_time: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotTravelling {
  id: string;
  term_id: string;
  no_flights: boolean;
  no_transport: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  phone_number: string;
  license_number: string | null;
  vehicle_type: 'school-coach' | 'taxi';
  email: string | null;
  notes: string | null;
  rating: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Request body types for POST/PUT operations
export type CreateFlightDTO = Omit<Flight, 'id' | 'created_at' | 'updated_at'>;
export type UpdateFlightDTO = Partial<CreateFlightDTO>;

export type CreateTransportDTO = Omit<Transport, 'id' | 'created_at' | 'updated_at'>;
export type UpdateTransportDTO = Partial<CreateTransportDTO>;

export type CreateServiceProviderDTO = Omit<ServiceProvider, 'id' | 'created_at' | 'updated_at'>;
export type UpdateServiceProviderDTO = Partial<CreateServiceProviderDTO>;

export type UpsertNotTravellingDTO = {
  term_id: string;
  no_flights?: boolean;
  no_transport?: boolean;
};
