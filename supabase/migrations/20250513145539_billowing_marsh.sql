/*
  # Add Bonus Features and Niche-Specific Tables

  This migration adds tables and functionality for:
  - Task export capabilities
  - Notification preferences
  - Browser extension support
  - Progress tracking
  - Screen recording features
  
  It also ensures all tables have proper RLS policies and indexes.
*/

-- Add new columns to tasks table for enhanced features
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS export_format text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS last_exported_at timestamptz;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS recording_url text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS recording_duration interval;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS browser_extension_data jsonb;

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_chat_id text,
  whatsapp_number text,
  email_frequency text DEFAULT 'daily',
  daily_summary_time time DEFAULT '18:00',
  telegram_enabled boolean DEFAULT false,
  whatsapp_enabled boolean DEFAULT false,
  email_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create browser extension data table
CREATE TABLE IF NOT EXISTS public.browser_extension_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text NOT NULL,
  description text,
  tags text[],
  created_at timestamptz DEFAULT now()
);

-- Create productivity reports table
CREATE TABLE IF NOT EXISTS public.productivity_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  week_end date NOT NULL,
  tasks_completed integer DEFAULT 0,
  total_time_spent interval DEFAULT '0',
  productivity_score numeric DEFAULT 0,
  top_categories text[],
  areas_for_improvement text[],
  created_at timestamptz DEFAULT now()
);

-- Create screen recordings table
CREATE TABLE IF NOT EXISTS public.screen_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  duration interval NOT NULL,
  thumbnail_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.browser_extension_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_recordings ENABLE ROW LEVEL SECURITY;

-- Create policies with existence checks
DO $$ BEGIN
  -- Notification Preferences
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notification_preferences' 
    AND policyname = 'Users can manage their notification preferences'
  ) THEN
    CREATE POLICY "Users can manage their notification preferences"
      ON public.notification_preferences
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Browser Extension Data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'browser_extension_data' 
    AND policyname = 'Users can manage their browser extension data'
  ) THEN
    CREATE POLICY "Users can manage their browser extension data"
      ON public.browser_extension_data
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Productivity Reports
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'productivity_reports' 
    AND policyname = 'Users can view their productivity reports'
  ) THEN
    CREATE POLICY "Users can view their productivity reports"
      ON public.productivity_reports
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Screen Recordings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'screen_recordings' 
    AND policyname = 'Users can manage their screen recordings'
  ) THEN
    CREATE POLICY "Users can manage their screen recordings"
      ON public.screen_recordings
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id 
  ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_browser_extension_data_user_id 
  ON public.browser_extension_data(user_id);
CREATE INDEX IF NOT EXISTS idx_browser_extension_data_url 
  ON public.browser_extension_data(url);
CREATE INDEX IF NOT EXISTS idx_productivity_reports_user_id 
  ON public.productivity_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_productivity_reports_week 
  ON public.productivity_reports(week_start, week_end);
CREATE INDEX IF NOT EXISTS idx_screen_recordings_task_id 
  ON public.screen_recordings(task_id);
CREATE INDEX IF NOT EXISTS idx_screen_recordings_user_id 
  ON public.screen_recordings(user_id);