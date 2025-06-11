/*
  # Add preferences column to users table

  1. Changes
    - Add `preferences` JSONB column to `users` table with default empty object
    - Column will store user preferences like:
      - defaultView
      - showCompletedTasks
      - enableNotifications
      - etc.

  2. Security
    - No additional security needed as the users table already has RLS policies
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'preferences'
  ) THEN
    ALTER TABLE users 
    ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;