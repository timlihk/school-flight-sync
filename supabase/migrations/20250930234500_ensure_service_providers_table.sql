-- Ensure service_providers table exists with all necessary components
-- This is idempotent - safe to run multiple times

-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create service_providers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.service_providers (
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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_service_providers_name ON public.service_providers(name);
CREATE INDEX IF NOT EXISTS idx_service_providers_vehicle_type ON public.service_providers(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_service_providers_is_active ON public.service_providers(is_active);

-- Enable Row Level Security
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Allow all operations on service_providers" ON public.service_providers;
CREATE POLICY "Allow all operations on service_providers"
ON public.service_providers
FOR ALL
USING (true)
WITH CHECK (true);

-- Create or replace trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_service_providers_updated_at ON public.service_providers;
CREATE TRIGGER update_service_providers_updated_at
BEFORE UPDATE ON public.service_providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();