
-- Create master_ingredients table to store the uploaded master spreadsheet
CREATE TABLE public.master_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cas_number TEXT NOT NULL,
  chemical_name TEXT,
  aics_listed TEXT,
  specific_information_requirement TEXT,
  susmp TEXT,
  nzoic TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on CAS number for faster lookups
CREATE UNIQUE INDEX idx_master_ingredients_cas_number ON public.master_ingredients(cas_number);

-- Add RLS policies - only admins can access
ALTER TABLE public.master_ingredients ENABLE ROW LEVEL SECURITY;

-- Only admins can view master ingredients
CREATE POLICY "Only admins can view master ingredients" 
  ON public.master_ingredients 
  FOR SELECT 
  USING (public.is_admin_user());

-- Only admins can insert master ingredients
CREATE POLICY "Only admins can insert master ingredients" 
  ON public.master_ingredients 
  FOR INSERT 
  WITH CHECK (public.is_admin_user());

-- Only admins can update master ingredients
CREATE POLICY "Only admins can update master ingredients" 
  ON public.master_ingredients 
  FOR UPDATE 
  USING (public.is_admin_user());

-- Only admins can delete master ingredients
CREATE POLICY "Only admins can delete master ingredients" 
  ON public.master_ingredients 
  FOR DELETE 
  USING (public.is_admin_user());

-- Create table to track master ingredients uploads
CREATE TABLE public.master_ingredients_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  records_count INTEGER NOT NULL DEFAULT 0
);

-- Add RLS for uploads table
ALTER TABLE public.master_ingredients_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access uploads table" 
  ON public.master_ingredients_uploads 
  FOR ALL
  USING (public.is_admin_user());
