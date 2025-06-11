/*
  # Create user progress table

  1. New Tables
    - `user_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `xp` (integer)
      - `level` (integer)
      - `badges` (jsonb array)
      - `streak_days` (integer)
      - `last_task_date` (timestamp)
      - `tasks_completed` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `user_progress` table
    - Add policies for:
      - Users can manage their own progress
      - Users can view leaderboard data

  3. Indexes
    - Index on user_id for faster lookups
*/

-- Create the user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
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
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);

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