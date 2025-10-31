-- Railway PostgreSQL Schema
-- Consolidated schema for UK Flight Sync application
-- Generated from Supabase migrations for Railway.app migration

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Flights table: Stores flight information (outbound/return flights)
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

-- Transport table: Ground transportation (school-coach and taxi)
CREATE TABLE public.transport (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'school-coach' or 'taxi'
  direction TEXT NOT NULL CHECK (direction IN ('outbound', 'return')),
  driver_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  license_number TEXT NOT NULL,
  pickup_time TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.transport.direction IS 'Direction of travel: outbound (from school) or return (to school)';

-- Not travelling table: Tracks terms where family doesn't need flights/transport
CREATE TABLE public.not_travelling (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term_id TEXT NOT NULL,
  no_flights BOOLEAN DEFAULT FALSE,
  no_transport BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(term_id)
);

-- Service providers table: Reusable database of transport providers
CREATE TABLE public.service_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  license_number TEXT,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('school-coach', 'taxi')),
  email TEXT,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Indexes for service_providers table
CREATE INDEX idx_service_providers_name ON public.service_providers(name);
CREATE INDEX idx_service_providers_vehicle_type ON public.service_providers(vehicle_type);
CREATE INDEX idx_service_providers_is_active ON public.service_providers(is_active);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger for automatic timestamp updates on flights
CREATE TRIGGER update_flights_updated_at
BEFORE UPDATE ON public.flights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for automatic timestamp updates on transport
CREATE TRIGGER update_transport_updated_at
BEFORE UPDATE ON public.transport
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for automatic timestamp updates on not_travelling
CREATE TRIGGER update_not_travelling_updated_at
BEFORE UPDATE ON public.not_travelling
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for automatic timestamp updates on service_providers
CREATE TRIGGER update_service_providers_updated_at
BEFORE UPDATE ON public.service_providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
