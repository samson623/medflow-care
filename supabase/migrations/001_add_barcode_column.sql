-- Migration: Add barcode column to medications table
-- Run this in Supabase SQL Editor to add barcode scanning support

ALTER TABLE public.medications
ADD COLUMN IF NOT EXISTS barcode text;

-- Add index for barcode lookups
CREATE INDEX IF NOT EXISTS idx_medications_barcode ON public.medications(barcode)
WHERE barcode IS NOT NULL;
