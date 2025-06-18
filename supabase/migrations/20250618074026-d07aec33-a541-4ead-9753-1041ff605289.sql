
-- Add new status values to support draft reviews and client notifications
ALTER TYPE formula_status ADD VALUE IF NOT EXISTS 'in_review_draft';
ALTER TYPE formula_status ADD VALUE IF NOT EXISTS 'review_completed';
ALTER TYPE formula_status ADD VALUE IF NOT EXISTS 'sent_to_client';

-- Add columns to track when review was completed vs when it was sent to client
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sent_to_client_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT true;

-- Add column to formulas table to track the latest status change
ALTER TABLE public.formulas 
ADD COLUMN IF NOT EXISTS review_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sent_to_client_at TIMESTAMP WITH TIME ZONE;
