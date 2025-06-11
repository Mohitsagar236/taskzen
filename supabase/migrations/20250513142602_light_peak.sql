/*
  # Add Routines and Templates

  1. New Tables
    - `task_templates`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `user_id` (uuid, references auth.users)
      - `tasks` (jsonb)
      - `created_at` (timestamptz)
    
    - `routines`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `user_id` (uuid, references auth.users)
      - `template_id` (uuid, references task_templates)
      - `schedule` (jsonb)
      - `last_run` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own routines and templates
*/

-- Create task templates table
CREATE TABLE IF NOT EXISTS task_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tasks jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for task templates
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;

-- Policies for task templates
CREATE POLICY "Users can manage their own templates"
  ON task_templates
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create routines table
CREATE TABLE IF NOT EXISTS routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id uuid REFERENCES task_templates(id) ON DELETE CASCADE NOT NULL,
  schedule jsonb NOT NULL,
  last_run timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for routines
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

-- Policies for routines
CREATE POLICY "Users can manage their own routines"
  ON routines
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_templates_user_id ON task_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines(user_id);
CREATE INDEX IF NOT EXISTS idx_routines_template_id ON routines(template_id);