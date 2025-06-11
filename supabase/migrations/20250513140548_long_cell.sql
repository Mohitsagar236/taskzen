/*
  # Add Time Tracking Features

  1. New Tables
    - `time_entries`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `user_id` (uuid, references auth.users)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `duration` (interval)
      - `type` (text) - 'pomodoro' or 'manual'
      - `created_at` (timestamptz)
    
    - `pomodoro_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `work_duration` (interval)
      - `break_duration` (interval)
      - `long_break_duration` (interval)
      - `sessions_until_long_break` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration interval,
  type text NOT NULL CHECK (type IN ('pomodoro', 'manual')),
  created_at timestamptz DEFAULT now()
);

-- Create pomodoro_settings table
CREATE TABLE IF NOT EXISTS pomodoro_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  work_duration interval NOT NULL DEFAULT '25 minutes'::interval,
  break_duration interval NOT NULL DEFAULT '5 minutes'::interval,
  long_break_duration interval NOT NULL DEFAULT '15 minutes'::interval,
  sessions_until_long_break integer NOT NULL DEFAULT 4,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_settings ENABLE ROW LEVEL SECURITY;

-- Policies for time_entries
CREATE POLICY "Users can manage their time entries"
  ON time_entries
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for pomodoro_settings
CREATE POLICY "Users can manage their pomodoro settings"
  ON pomodoro_settings
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());