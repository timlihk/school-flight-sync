-- Create service_providers table for storing reusable transport provider information
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

-- Create indexes for better performance
CREATE INDEX idx_service_providers_name ON public.service_providers(name);
CREATE INDEX idx_service_providers_vehicle_type ON public.service_providers(vehicle_type);
CREATE INDEX idx_service_providers_is_active ON public.service_providers(is_active);

-- Enable Row Level Security (matching existing tables)
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (same as other tables)
CREATE POLICY "Allow all operations on service_providers" 
ON public.service_providers 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_service_providers_updated_at
BEFORE UPDATE ON public.service_providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();