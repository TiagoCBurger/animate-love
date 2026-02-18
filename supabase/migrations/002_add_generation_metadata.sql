-- Add metadata columns to generations table for dashboard display
ALTER TABLE public.generations
  ADD COLUMN name TEXT,
  ADD COLUMN thumbnail_url TEXT,
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- RLS policy: users can update their own generations
CREATE POLICY "Users can update own generations" ON public.generations
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for efficient dashboard listing (user's most recent first)
CREATE INDEX idx_generations_user_created ON public.generations (user_id, created_at DESC);
