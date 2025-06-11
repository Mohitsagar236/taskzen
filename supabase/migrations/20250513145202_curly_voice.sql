/*
  # Implement niche-focused features

  1. Fix user_progress table
  2. Add niche-specific tables and features
  3. Set up proper security and relationships

  This migration:
  - Drops and recreates user_progress table with proper structure
  - Creates tables for student features (courses, assignments)
  - Creates tables for developer features (github_integrations, code_snippets)
  - Creates tables for freelancer features (clients, projects, invoices)
  - Creates tables for team features (teams, sprints)
  - Sets up RLS policies and indexes
*/

-- Drop existing table if it exists
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

-- Student Features
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  instructor text,
  schedule text,
  credits integer NOT NULL DEFAULT 3,
  grade text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('homework', 'exam', 'project', 'reading')),
  due_date timestamptz,
  weight numeric NOT NULL DEFAULT 1,
  grade numeric,
  created_at timestamptz DEFAULT now()
);

-- Developer Features
CREATE TABLE IF NOT EXISTS public.github_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  default_repository text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.code_snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  language text NOT NULL,
  code text NOT NULL,
  tags text[],
  created_at timestamptz DEFAULT now()
);

-- Freelancer Features
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  rate numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  budget numeric,
  rate numeric,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid')),
  due_date timestamptz,
  items jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Team/Startup Features
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  members jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  goals text[],
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'review', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables
CREATE POLICY "Users can manage their own courses"
  ON public.courses FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own assignments"
  ON public.assignments FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own github integrations"
  ON public.github_integrations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own code snippets"
  ON public.code_snippets FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own clients"
  ON public.clients FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own projects"
  ON public.projects FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own invoices"
  ON public.invoices FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Team members can access their teams"
  ON public.teams FOR ALL
  TO authenticated
  USING (auth.uid() = ANY((members->>'id')::uuid[]));

CREATE POLICY "Team members can access their sprints"
  ON public.sprints FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.teams
    WHERE id = sprints.team_id
    AND auth.uid() = ANY((members->>'id')::uuid[])
  ));

-- Create indexes for better performance
CREATE INDEX idx_assignments_course_id ON public.assignments(course_id);
CREATE INDEX idx_assignments_user_id ON public.assignments(user_id);
CREATE INDEX idx_projects_client_id ON public.projects(client_id);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_invoices_project_id ON public.invoices(project_id);
CREATE INDEX idx_sprints_team_id ON public.sprints(team_id);