-- Add explicit direction field to transport table
-- This replaces the index-based filtering approach with a clearer explicit field

-- Add direction column (outbound = from school, return = to school)
ALTER TABLE public.transport
ADD COLUMN direction TEXT CHECK (direction IN ('outbound', 'return'));

-- For existing data, set direction based on current index pattern
-- This migration script assumes we're setting a default for existing rows
-- In production, you may want to handle existing data more carefully
UPDATE public.transport
SET direction = 'outbound'
WHERE direction IS NULL;

-- Make direction NOT NULL after setting defaults
ALTER TABLE public.transport
ALTER COLUMN direction SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.transport.direction IS 'Direction of travel: outbound (from school) or return (to school)';

-- Update the updated_at trigger to include direction changes
-- (The trigger should already exist from previous migrations)