-- Add direction column to transport table
ALTER TABLE public.transport ADD COLUMN IF NOT EXISTS direction TEXT NOT NULL DEFAULT 'outbound';

-- Add check constraint to ensure direction is either 'outbound' or 'return'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_transport_direction'
    ) THEN
        ALTER TABLE public.transport ADD CONSTRAINT check_transport_direction 
        CHECK (direction IN ('outbound', 'return'));
    END IF;
END $$;

-- Update existing records to have 'outbound' as default direction
UPDATE public.transport SET direction = 'outbound' WHERE direction IS NULL;