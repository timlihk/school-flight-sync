-- Simplify database for family-only use
-- Remove user-specific restrictions and make it open for family use

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can view their own flights" ON public.flights;
DROP POLICY IF EXISTS "Users can insert their own flights" ON public.flights;
DROP POLICY IF EXISTS "Users can update their own flights" ON public.flights;
DROP POLICY IF EXISTS "Users can delete their own flights" ON public.flights;

DROP POLICY IF EXISTS "Users can view their own transport" ON public.transport;
DROP POLICY IF EXISTS "Users can insert their own transport" ON public.transport;
DROP POLICY IF EXISTS "Users can update their own transport" ON public.transport;
DROP POLICY IF EXISTS "Users can delete their own transport" ON public.transport;

DROP POLICY IF EXISTS "Users can view their own not_travelling status" ON public.not_travelling;
DROP POLICY IF EXISTS "Users can insert their own not_travelling status" ON public.not_travelling;
DROP POLICY IF EXISTS "Users can update their own not_travelling status" ON public.not_travelling;
DROP POLICY IF EXISTS "Users can delete their own not_travelling status" ON public.not_travelling;

DROP POLICY IF EXISTS "Users can view their own user_data" ON public.user_data;
DROP POLICY IF EXISTS "Users can insert their own user_data" ON public.user_data;
DROP POLICY IF EXISTS "Users can update their own user_data" ON public.user_data;

-- Drop user_id triggers
DROP TRIGGER IF EXISTS set_flights_user_id ON public.flights;
DROP TRIGGER IF EXISTS set_transport_user_id ON public.transport;
DROP TRIGGER IF EXISTS set_not_travelling_user_id ON public.not_travelling;

-- Drop the set_user_id function
DROP FUNCTION IF EXISTS public.set_user_id();

-- Drop user_data table as it's not needed for family use
DROP TABLE IF EXISTS public.user_data;

-- Disable RLS for family use (allow all operations)
ALTER TABLE public.flights DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.not_travelling DISABLE ROW LEVEL SECURITY;

-- Remove user_id columns as they're not needed for family use
ALTER TABLE public.flights DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.transport DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.not_travelling DROP COLUMN IF EXISTS user_id;

-- Create simple policies that allow all operations for family use
-- (Optional: if you want to keep RLS enabled but allow everything)
-- ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations for family" ON public.flights FOR ALL USING (true) WITH CHECK (true);

-- ALTER TABLE public.transport ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations for family" ON public.transport FOR ALL USING (true) WITH CHECK (true);

-- ALTER TABLE public.not_travelling ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations for family" ON public.not_travelling FOR ALL USING (true) WITH CHECK (true);