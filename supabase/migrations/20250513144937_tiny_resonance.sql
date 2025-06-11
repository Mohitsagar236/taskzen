/*
  # Fix user_progress table and relationships

  1. Changes
    - Drop existing user_progress table if it exists
    - Create user_progress table with correct schema
    - Add proper indexes and foreign key relationships
    - Set up RLS policies
    - Add view relationship to users table

  2. Security
    - Enable RLS
    - Add policies for data access
*/

-- Drop existing table and policies
DROP TABLE IF EXISTS public.user_progress CASCADE;

-- Create the user_progress table
CREATE TABLE public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  badges jsonb[] NOT NULL DEFAULT '{}',
  streak_days integer NOT NULL DEFAULT 0,
  last_task_date timestamptz NOT NULL DEFAULT now(),
  tasks_completed integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own progress"
  ON public.user_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view leaderboard data"
  ON public.user_progress
  FOR SELECT
  TO authenticated
  USING (true);

-- Create view to join user_progress with users
CREATE OR REPLACE VIEW public.user_progress_with_users AS
SELECT 
  p.*,
  u.email,
  u.raw_user_meta_data->>'name' as user_name
FROM 
  public.user_progress p
  JOIN auth.users u ON p.user_id = u.id;