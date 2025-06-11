/*
  # Add niche-specific features and policies

  This migration adds tables and policies for different user types (students, developers, freelancers, teams)
  while ensuring no conflicts with existing policies.

  1. Tables
    - Courses and assignments for students
    - GitHub integrations and code snippets for developers
    - Clients, projects, and invoices for freelancers
    - Teams and sprints for startups

  2. Security
    - Enables RLS on all tables
    - Adds appropriate policies with existence checks
    - Creates necessary indexes

  3. Changes
    - Adds IF NOT EXISTS to all table and index creation
    - Wraps policy creation in DO blocks to check existence
*/

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

-- Create policies with existence checks
DO $$ BEGIN
  -- Courses
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'courses' 
    AND policyname = 'Users can manage their own courses'
  ) THEN
    CREATE POLICY "Users can manage their own courses"
      ON public.courses FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Assignments
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'assignments' 
    AND policyname = 'Users can manage their own assignments'
  ) THEN
    CREATE POLICY "Users can manage their own assignments"
      ON public.assignments FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- GitHub Integrations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'github_integrations' 
    AND policyname = 'Users can manage their own github integrations'
  ) THEN
    CREATE POLICY "Users can manage their own github integrations"
      ON public.github_integrations FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Code Snippets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'code_snippets' 
    AND policyname = 'Users can manage their own code snippets'
  ) THEN
    CREATE POLICY "Users can manage their own code snippets"
      ON public.code_snippets FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Clients
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clients' 
    AND policyname = 'Users can manage their own clients'
  ) THEN
    CREATE POLICY "Users can manage their own clients"
      ON public.clients FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Projects
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can manage their own projects'
  ) THEN
    CREATE POLICY "Users can manage their own projects"
      ON public.projects FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Invoices
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'invoices' 
    AND policyname = 'Users can manage their own invoices'
  ) THEN
    CREATE POLICY "Users can manage their own invoices"
      ON public.invoices FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Teams
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'teams' 
    AND policyname = 'Team members can access their teams'
  ) THEN
    CREATE POLICY "Team members can access their teams"
      ON public.teams FOR ALL
      TO authenticated
      USING (auth.uid() = ANY((members->>'id')::uuid[]));
  END IF;

  -- Sprints
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sprints' 
    AND policyname = 'Team members can access their sprints'
  ) THEN
    CREATE POLICY "Team members can access their sprints"
      ON public.sprints FOR ALL
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM public.teams
        WHERE id = sprints.team_id
        AND auth.uid() = ANY((members->>'id')::uuid[])
      ));
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON public.assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON public.assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON public.invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_sprints_team_id ON public.sprints(team_id);