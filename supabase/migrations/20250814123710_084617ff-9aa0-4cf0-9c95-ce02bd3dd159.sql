-- Create not_travelling table to persist "not traveling" status
CREATE TABLE public.not_travelling (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term_id TEXT NOT NULL,
  no_flights BOOLEAN DEFAULT FALSE,
  no_transport BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(term_id)
);

-- Enable Row Level Security
ALTER TABLE public.not_travelling ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on not_travelling" 
ON public.not_travelling 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_not_travelling_updated_at
BEFORE UPDATE ON public.not_travelling
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();