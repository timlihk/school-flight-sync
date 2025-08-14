-- Create transport table
CREATE TABLE public.transport (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'to_school' or 'from_school'
  method TEXT NOT NULL, -- 'car', 'train', 'other'
  departure_location TEXT,
  arrival_location TEXT,
  departure_date DATE NOT NULL,
  departure_time TEXT,
  arrival_date DATE,
  arrival_time TEXT,
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