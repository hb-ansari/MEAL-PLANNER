-- Create public meal_plans table for guest-first anonymous storage
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  preferences JSONB NOT NULL,
  weekly_total_estimated_cost NUMERIC NOT NULL,
  daily_plans JSONB NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD'
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- Allow public read access (Guest-First pattern)
CREATE POLICY "Allow public read access" ON public.meal_plans
  FOR SELECT USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access" ON public.meal_plans
  FOR INSERT WITH CHECK (true);

-- Allow public update access for meal swaps
CREATE POLICY "Allow public update access" ON public.meal_plans
  FOR UPDATE USING (true);
