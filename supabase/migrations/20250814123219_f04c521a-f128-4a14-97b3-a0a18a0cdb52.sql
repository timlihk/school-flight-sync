-- Drop the existing transport table to recreate with correct schema
DROP TABLE IF EXISTS public.transport;

-- Create transport table with correct schema matching TransportDetails type
CREATE TABLE public.transport (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'school-coach' or 'taxi'
  driver_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  license_number TEXT NOT NULL,
  pickup_time TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transport ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (same as flights table)
CREATE POLICY "Allow all operations on transport" 
ON public.transport 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_transport_updated_at
BEFORE UPDATE ON public.transport
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();