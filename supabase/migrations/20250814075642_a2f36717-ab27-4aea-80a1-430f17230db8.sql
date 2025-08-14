-- Add confirmation_code column to flights table
ALTER TABLE public.flights 
ADD COLUMN confirmation_code TEXT;